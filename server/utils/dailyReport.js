const cron = require("node-cron");
const { sendEmail } = require("./email");
const AnalyticsEvent = require("../models/analyticsevent");
const User = require("../models/user");

async function sendDailyReport() {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const range = { $gte: since };

    const [totalVisits, uniqueSessions, contactSubmissions, newUsers] = await Promise.all([
      AnalyticsEvent.countDocuments({ eventType: "page_view", ts: range }),
      AnalyticsEvent.distinct("sessionId", { ts: range, sessionId: { $ne: null } }),
      AnalyticsEvent.countDocuments({ eventType: "contact_submit", ts: range }),
      User.find({ createdAt: range, role: "client" }).select("name email createdAt").lean(),
    ]);

    const reportDate = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const newUserRows = newUsers.length
      ? newUsers
          .map(
            (u) =>
              `<tr>
                <td style="padding:6px 12px;border-bottom:1px solid #eee;">${u.name}</td>
                <td style="padding:6px 12px;border-bottom:1px solid #eee;">${u.email}</td>
              </tr>`
          )
          .join("")
      : `<tr><td colspan="2" style="padding:6px 12px;color:#999;">No new registrations</td></tr>`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;">
        <div style="background:#1a3a5c;padding:24px;border-radius:8px 8px 0 0;">
          <h1 style="color:#fff;margin:0;font-size:20px;">Daily Analytics Report</h1>
          <p style="color:#a8c4e0;margin:4px 0 0;">${reportDate}</p>
        </div>

        <div style="background:#f9f9f9;padding:24px;border-radius:0 0 8px 8px;">
          <h2 style="font-size:16px;color:#1a3a5c;margin:0 0 16px;">Last 24 Hours</h2>

          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <tr style="background:#fff;">
              <td style="padding:14px 16px;border-radius:6px;border:1px solid #e0e0e0;text-align:center;width:25%;">
                <div style="font-size:28px;font-weight:bold;color:#1a3a5c;">${totalVisits}</div>
                <div style="font-size:12px;color:#666;margin-top:4px;">Page Views</div>
              </td>
              <td style="width:2%;"></td>
              <td style="padding:14px 16px;border-radius:6px;border:1px solid #e0e0e0;text-align:center;width:25%;">
                <div style="font-size:28px;font-weight:bold;color:#1a3a5c;">${uniqueSessions.length}</div>
                <div style="font-size:12px;color:#666;margin-top:4px;">Unique Sessions</div>
              </td>
              <td style="width:2%;"></td>
              <td style="padding:14px 16px;border-radius:6px;border:1px solid #e0e0e0;text-align:center;width:25%;">
                <div style="font-size:28px;font-weight:bold;color:#1a3a5c;">${contactSubmissions}</div>
                <div style="font-size:12px;color:#666;margin-top:4px;">Contact Forms</div>
              </td>
              <td style="width:2%;"></td>
              <td style="padding:14px 16px;border-radius:6px;border:1px solid #e0e0e0;text-align:center;width:25%;">
                <div style="font-size:28px;font-weight:bold;color:#1a3a5c;">${newUsers.length}</div>
                <div style="font-size:12px;color:#666;margin-top:4px;">New Clients</div>
              </td>
            </tr>
          </table>

          <h2 style="font-size:16px;color:#1a3a5c;margin:0 0 12px;">New Client Registrations</h2>
          <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:6px;border:1px solid #e0e0e0;overflow:hidden;">
            <thead>
              <tr style="background:#1a3a5c;">
                <th style="padding:8px 12px;color:#fff;text-align:left;font-size:13px;">Name</th>
                <th style="padding:8px 12px;color:#fff;text-align:left;font-size:13px;">Email</th>
              </tr>
            </thead>
            <tbody>
              ${newUserRows}
            </tbody>
          </table>

          <p style="margin:24px 0 0;font-size:12px;color:#999;text-align:center;">
            Immigration Pathways Consulting &mdash; Automated Daily Report
          </p>
        </div>
      </div>
    `;

    await sendEmail(
      process.env.ADMIN_EMAIL,
      `Daily Report — ${reportDate}`,
      html
    );

    console.log(`Daily report sent to ${process.env.ADMIN_EMAIL}`);
  } catch (err) {
    console.error("Daily report failed:", err.message);
  }
}

// Run every day at 8:00 AM server time
cron.schedule("0 8 * * *", sendDailyReport);

module.exports = { sendDailyReport };
