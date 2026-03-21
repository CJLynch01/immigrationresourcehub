import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const GOLD = "#c9a84c";
const GOLD2 = "#e8c96a";
const WHITE = "#ffffff";
const GRAY = "#888";

const SECTION_COLORS = {
  Home:     GOLD,
  Services: "#e8c96a",
  Blog:     WHITE,
  Contact:  "#aaaaaa",
  Admin:    "#6699cc",
  Client:   "#88cc88",
  Other:    "#666666",
};

const PIE_COLORS = [GOLD, "#e8c96a", WHITE, "#888", "#6699cc", "#88cc88"];

const EVENT_LABELS = {
  page_view:       "Viewed page",
  login_success:   "Logged in",
  login_failure:   "Failed login",
  register_submit: "Registered",
  contact_submit:  "Submitted Contact Form",
  doc_upload:      "Uploaded document",
  doc_download:    "Downloaded document",
  quiz_submit:     "Submitted quiz",
  blog_post_view:  "Viewed Blog Post",
};

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} mins ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

function pctLabel(val) {
  if (val === null || val === undefined) return null;
  const sign = val >= 0 ? "+" : "";
  return `${sign}${val}%`;
}

function localDateStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().slice(0, 10);
}

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("30"); // "today" | "yesterday" | "7" | "30" | "90"

  const fmtDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });

  const rangeLabel = () => {
    if (filter === "today") return `Today — ${fmtDate(localDateStr(0))}`;
    if (filter === "yesterday") return `Yesterday — ${fmtDate(localDateStr(1))}`;
    const now = new Date();
    const from = new Date(now - Number(filter) * 24 * 60 * 60 * 1000);
    return `${fmtDate(from)} → ${fmtDate(now)}`;
  };

  const apiUrl = () => {
    if (filter === "today") return `${API_BASE}/api/analytics?date=${localDateStr(0)}`;
    if (filter === "yesterday") return `${API_BASE}/api/analytics?date=${localDateStr(1)}`;
    return `${API_BASE}/api/analytics?days=${filter}`;
  };

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(apiUrl(), { headers: { ...authHeaders() } });
        if (!res.ok) throw new Error("Failed to load analytics.");
        setData(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filter]);

  return (
    <div className="analytics-page">

      {/* Header */}
      <div className="analytics-header">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginBottom: "0.25rem" }}>
          <span className="analytics-header__rule" />
          <h1>Analytics Dashboard</h1>
          <span className="analytics-header__rule" />
        </div>
        <p style={{ margin: 0, color: GOLD, letterSpacing: 2 }}>
          — Immigration Pathways Consulting —
        </p>
      </div>

      {/* Date range + filter */}
      <div className="analytics-filters">
        <span style={{ fontSize: "0.9rem", color: GRAY, marginRight: "0.25rem" }}>
          {rangeLabel()}
        </span>
        {["today", "yesterday", "7", "30", "90"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              background: filter === f ? GOLD : "#222",
              color: filter === f ? "#000" : GRAY,
              border: `1px solid ${filter === f ? GOLD : "#444"}`,
              borderRadius: 4,
              padding: "0.4rem 0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            {f === "today" ? "Today" : f === "yesterday" ? "Yesterday" : `${f}d`}
          </button>
        ))}
      </div>

      {loading && <p style={{ textAlign: "center", color: GRAY }}>Loading analytics...</p>}
      {error && <p style={{ textAlign: "center", color: "crimson" }}>{error}</p>}

      {data && (
        <>
          {/* Stat Cards */}
          <div className="analytics-stat-grid">
            <StatCard
              label="Total Visits"
              value={data.totalVisits.toLocaleString()}
              change={pctLabel(data.totalVisitsChange)}
              positive={data.totalVisitsChange >= 0}
              icon="📈"
            />
            <StatCard
              label="Services Views"
              value={data.servicesViews.toLocaleString()}
              icon="💼"
            />
            <StatCard
              label="Blog Views"
              value={data.blogViews.toLocaleString()}
              icon="📝"
            />
            <StatCard
              label="Contact Submissions"
              value={data.contactSubmissions.toLocaleString()}
              change={pctLabel(data.contactSubmissionsChange)}
              positive={data.contactSubmissionsChange >= 0}
              icon="✉️"
            />
          </div>

          {/* Middle row */}
          <div className="analytics-middle-grid">

            {/* Pie chart */}
            <Card title="Page Views by Section">
              {data.sectionViews.length === 0 ? (
                <p style={{ color: GRAY, fontSize: "0.9rem" }}>No data yet.</p>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <PieChart width={140} height={140}>
                    <Pie
                      data={data.sectionViews}
                      dataKey="value"
                      cx={65}
                      cy={65}
                      innerRadius={38}
                      outerRadius={65}
                      strokeWidth={0}
                    >
                      {data.sectionViews.map((entry, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {data.sectionViews.map((s, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem" }}>
                        <span style={{ width: 10, height: 10, borderRadius: "50%", background: PIE_COLORS[i % PIE_COLORS.length], display: "inline-block", flexShrink: 0 }} />
                        <span>{s.name}</span>
                        <span style={{ color: GOLD, marginLeft: "auto" }}>{s.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Recent activity */}
            <Card title="Recent User Activity">
              {data.recentActivity.length === 0 ? (
                <p style={{ color: GRAY, fontSize: "0.9rem" }}>No recent activity.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                  <thead>
                    <tr style={{ color: GRAY, borderBottom: `1px solid #333` }}>
                      <th style={{ textAlign: "left", padding: "0.3rem 0.5rem" }}>User</th>
                      <th style={{ textAlign: "left", padding: "0.3rem 0.5rem" }}>Action</th>
                      <th style={{ textAlign: "center", padding: "0.3rem 0.5rem" }}>Device</th>
                      <th style={{ textAlign: "right", padding: "0.3rem 0.5rem" }}>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentActivity.slice(0, 6).map((e, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #1a1a1a" }}>
                        <td style={{ padding: "0.35rem 0.5rem", color: e.userType === "admin" ? GOLD : WHITE, textTransform: "capitalize" }}>
                          {e.userType === "admin" ? "Admin" : "Public User"}
                        </td>
                        <td style={{ padding: "0.35rem 0.5rem", color: GRAY }}>
                          {EVENT_LABELS[e.eventType] || e.eventType}
                          {e.section ? <span style={{ color: WHITE }}> — {e.section}</span> : ""}
                        </td>
                        <td style={{ padding: "0.35rem 0.5rem", textAlign: "center", fontSize: "1rem" }} title={e.device || "unknown"}>
                          {e.device === "mobile" ? "📱" : e.device === "tablet" ? "💻" : "🖥️"}
                        </td>
                        <td style={{ padding: "0.35rem 0.5rem", textAlign: "right", color: GRAY, whiteSpace: "nowrap" }}>
                          {timeAgo(e.ts)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>

            {/* Device usage */}
            <Card title="Device Usage">
              {data.deviceUsage.length === 0 ? (
                <p style={{ color: GRAY, fontSize: "0.9rem" }}>No data yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
                  {data.deviceUsage.map((d, i) => (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginBottom: 4 }}>
                        <span style={{ textTransform: "capitalize" }}>
                          {d.name === "desktop" ? "🖥️" : d.name === "mobile" ? "📱" : "💻"} {d.name.charAt(0).toUpperCase() + d.name.slice(1)}
                        </span>
                        <span style={{ color: GOLD, fontWeight: 600 }}>{d.pct}%</span>
                      </div>
                      <div style={{ height: 6, background: "#2a2a2a", borderRadius: 3 }}>
                        <div style={{ height: "100%", width: `${d.pct}%`, background: GOLD, borderRadius: 3 }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Traffic overview line chart */}
          <Card title={`Traffic Overview — ${rangeLabel()}`}>
            {data.trafficOverTime.length === 0 ? (
              <p style={{ color: GRAY, fontSize: "0.9rem" }}>No traffic data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data.trafficOverTime} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: GRAY, fontSize: 11 }}
                    tickFormatter={(v) => v.slice(5)}
                    stroke="#333"
                  />
                  <YAxis tick={{ fill: GRAY, fontSize: 11 }} stroke="#333" />
                  <Tooltip
                    contentStyle={{ background: "#1a1a1a", border: `1px solid ${GOLD}`, borderRadius: 6 }}
                    labelStyle={{ color: GOLD }}
                    itemStyle={{ color: WHITE }}
                  />
                  <Legend wrapperStyle={{ color: GRAY, fontSize: "0.85rem" }} />
                  {["Home", "Services", "Blog", "Contact"].map((section) => (
                    <Line
                      key={section}
                      type="monotone"
                      dataKey={section}
                      stroke={SECTION_COLORS[section]}
                      strokeWidth={2}
                      dot={{ r: 3, fill: SECTION_COLORS[section] }}
                      activeDot={{ r: 5 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, change, positive, icon }) {
  return (
    <div style={{
      background: WHITE,
      color: "#111",
      borderRadius: 10,
      padding: "1rem 1.25rem",
      display: "flex",
      flexDirection: "column",
      gap: 6,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#444" }}>{label}</span>
        <span style={{ fontSize: "1.4rem" }}>{icon}</span>
      </div>
      <div style={{ fontSize: "2rem", fontWeight: 700 }}>{value}</div>
      {change !== null && change !== undefined && (
        <div style={{ fontSize: "0.85rem", color: positive ? "#2a9d2a" : "crimson", fontWeight: 600 }}>
          {positive ? "▲" : "▼"} {change}
        </div>
      )}
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={{
      background: "#111",
      border: "1px solid #2a2a2a",
      borderRadius: 10,
      padding: "1.25rem",
    }}>
      <h3 style={{ margin: "0 0 1rem", fontSize: "1rem", fontWeight: 600, color: WHITE }}>
        {title}
      </h3>
      {children}
    </div>
  );
}