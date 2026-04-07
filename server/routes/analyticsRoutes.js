const express = require("express");
const router = express.Router();
const trackEvent = require("../utils/trackEvent");
const AnalyticsEvent = require("../models/analyticsevent");
const User = require("../models/user");
const { verifyToken, isAdmin } = require("../middleware/auth");

function getDevice(ua = "") {
  if (/mobile/i.test(ua)) return "mobile";
  if (/tablet|ipad/i.test(ua)) return "tablet";
  if (ua) return "desktop";
  return "unknown";
}

// POST /api/analytics
router.post("/", async (req, res) => {
  const { eventType, pagePath, pageSection, userType, userId, sessionId, props } = req.body;

  if (!eventType || !pagePath) {
    return res.status(400).json({ error: "eventType and pagePath are required." });
  }

  const device = getDevice(req.headers["user-agent"]);

  await trackEvent({
    eventType,
    pagePath,
    pageSection,
    userType: userType || "public",
    userId: userId || null,
    device,
    sessionId: sessionId || null,
    props: props || {},
  });

  res.json({ ok: true });
});

// Section classification helper
function classifySection(path = "") {
  if (!path || path === "/") return "Home";
  if (path.startsWith("/services")) return "Services";
  if (path.startsWith("/blog")) return "Blog";
  if (path.startsWith("/contact")) return "Contact";
  if (path.startsWith("/admin")) return "Admin";
  if (path.startsWith("/client")) return "Client";
  if (path.startsWith("/register")) return "Register";
  return "Other";
}

// GET /api/analytics — admin only
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const { days = 30, date } = req.query;
    const now = new Date();

    let since, until, prevSince, prevUntil;

    if (date) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: "date must be in YYYY-MM-DD format." });
      }
      since = new Date(date + "T00:00:00.000Z");
      until = new Date(date + "T23:59:59.999Z");
      prevSince = new Date(since.getTime() - 7 * 24 * 60 * 60 * 1000);
      prevUntil = new Date(until.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else {
      const numDays = Number(days);
      if (isNaN(numDays) || numDays < 1 || numDays > 365) {
        return res.status(400).json({ error: "days must be between 1 and 365." });
      }
      since = new Date(now - numDays * 24 * 60 * 60 * 1000);
      until = now;
      prevSince = new Date(now - numDays * 2 * 24 * 60 * 60 * 1000);
      prevUntil = since;
    }

    const currRange = { $gte: since, $lte: until };
    const prevRange = { $gte: prevSince, $lte: prevUntil };

    const [
      totalCurrent,
      totalPrev,
      uniqueSessionsCurrent,
      uniqueSessionsPrev,
      byDevice,
      bySection,
      trafficByDayRaw,
      recentEvents,
      contactCurrent,
      contactPrev,
      newRegistrations,
    ] = await Promise.all([
      AnalyticsEvent.countDocuments({ eventType: "page_view", ts: currRange }),
      AnalyticsEvent.countDocuments({ eventType: "page_view", ts: prevRange }),

      AnalyticsEvent.distinct("sessionId", { ts: currRange, sessionId: { $ne: null } }),
      AnalyticsEvent.distinct("sessionId", { ts: prevRange, sessionId: { $ne: null } }),

      AnalyticsEvent.aggregate([
        { $match: { eventType: "page_view", ts: currRange } },
        { $group: { _id: "$device", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      AnalyticsEvent.aggregate([
        { $match: { eventType: "page_view", ts: currRange, "page.section": { $ne: "Admin" } } },
        { $group: { _id: "$page.section", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // per-day per-section for the traffic chart
      AnalyticsEvent.aggregate([
        { $match: { eventType: "page_view", ts: currRange } },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$ts" } },
              section: "$page.section",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.date": 1 } },
      ]),

      // recent activity feed (last 20 events, exclude admin)
      AnalyticsEvent.find({ ts: currRange, userType: { $ne: "admin" } })
        .sort({ ts: -1 })
        .limit(20)
        .select("eventType page userType device ts")
        .lean(),

      AnalyticsEvent.countDocuments({ eventType: "contact_submit", ts: currRange }),
      AnalyticsEvent.countDocuments({ eventType: "contact_submit", ts: prevRange }),

      User.find({ createdAt: currRange, role: "client" })
        .sort({ createdAt: -1 })
        .select("name email createdAt")
        .lean(),
    ]);

    // Pivot traffic data into { date, Home, Services, Blog, Contact } rows
    const trafficMap = {};
    for (const row of trafficByDayRaw) {
      const { date, section } = row._id;
      if (!trafficMap[date]) trafficMap[date] = { date };
      trafficMap[date][section || "Other"] = row.count;
    }
    const trafficOverTime = Object.values(trafficMap).sort((a, b) => a.date.localeCompare(b.date));

    // % change helper
    const pctChange = (curr, prev) =>
      prev === 0 ? null : Math.round(((curr - prev) / prev) * 100);

    // Section views for pie chart
    const sectionViews = bySection.map((s) => ({
      name: s._id || "Other",
      value: s.count,
    }));
    const totalSectionViews = sectionViews.reduce((s, r) => s + r.value, 0);
    const sectionViewsWithPct = sectionViews.map((s) => ({
      ...s,
      pct: totalSectionViews ? Math.round((s.value / totalSectionViews) * 100 * 10) / 10 : 0,
    }));

    // Device usage percentages
    const totalDeviceViews = byDevice.reduce((s, r) => s + r.count, 0);
    const deviceUsage = byDevice.map((d) => ({
      name: d._id || "unknown",
      count: d.count,
      pct: totalDeviceViews ? Math.round((d.count / totalDeviceViews) * 100) : 0,
    }));

    // Section-specific totals for stat cards
    const servicesViews = sectionViews.find((s) => s.name === "Services")?.value ?? 0;
    const blogViews = sectionViews.find((s) => s.name === "Blog")?.value ?? 0;

    res.json({
      totalVisits: totalCurrent,
      totalVisitsChange: pctChange(totalCurrent, totalPrev),
      uniqueSessions: uniqueSessionsCurrent.length,
      uniqueSessionsChange: pctChange(uniqueSessionsCurrent.length, uniqueSessionsPrev.length),
      servicesViews,
      blogViews,
      contactSubmissions: contactCurrent,
      contactSubmissionsChange: pctChange(contactCurrent, contactPrev),
      sectionViews: sectionViewsWithPct,
      deviceUsage,
      trafficOverTime,
      newRegistrations: newRegistrations.map((u) => ({
        name: u.name,
        email: u.email,
        createdAt: u.createdAt,
      })),
      recentActivity: recentEvents.map((e) => ({
        userType: e.userType,
        eventType: e.eventType,
        path: e.page?.path,
        section: e.page?.section,
        device: e.device,
        ts: e.ts,
      })),
    });
  } catch (err) {
    console.error("Analytics query error:", err.message);
    res.status(500).json({ error: "Failed to load analytics." });
  }
});

module.exports = router;