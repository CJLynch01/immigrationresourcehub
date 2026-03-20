const express = require("express");
const router = express.Router();
const trackEvent = require("../utils/trackEvent");
const AnalyticsEvent = require("../models/analyticsevent");
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
  return "Other";
}

// GET /api/analytics — admin only
router.get("/", verifyToken, isAdmin, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const numDays = Number(days);
    const now = new Date();
    const since = new Date(now - numDays * 24 * 60 * 60 * 1000);
    const prevSince = new Date(now - numDays * 2 * 24 * 60 * 60 * 1000);

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
    ] = await Promise.all([
      AnalyticsEvent.countDocuments({ eventType: "page_view", ts: { $gte: since } }),
      AnalyticsEvent.countDocuments({ eventType: "page_view", ts: { $gte: prevSince, $lt: since } }),

      AnalyticsEvent.distinct("sessionId", { ts: { $gte: since }, sessionId: { $ne: null } }),
      AnalyticsEvent.distinct("sessionId", { ts: { $gte: prevSince, $lt: since }, sessionId: { $ne: null } }),

      AnalyticsEvent.aggregate([
        { $match: { eventType: "page_view", ts: { $gte: since } } },
        { $group: { _id: "$device", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      AnalyticsEvent.aggregate([
        { $match: { eventType: "page_view", ts: { $gte: since } } },
        { $group: { _id: "$page.section", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // per-day per-section for the traffic chart
      AnalyticsEvent.aggregate([
        { $match: { eventType: "page_view", ts: { $gte: since } } },
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

      // recent activity feed (last 20 events)
      AnalyticsEvent.find({ ts: { $gte: since } })
        .sort({ ts: -1 })
        .limit(20)
        .select("eventType page userType ts")
        .lean(),

      AnalyticsEvent.countDocuments({ eventType: "contact_submit", ts: { $gte: since } }),
      AnalyticsEvent.countDocuments({ eventType: "contact_submit", ts: { $gte: prevSince, $lt: since } }),
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
      recentActivity: recentEvents.map((e) => ({
        userType: e.userType,
        eventType: e.eventType,
        path: e.page?.path,
        section: e.page?.section,
        ts: e.ts,
      })),
    });
  } catch (err) {
    console.error("Analytics query error:", err.message);
    res.status(500).json({ error: "Failed to load analytics." });
  }
});

module.exports = router;