const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Generate or reuse a session ID for the current browser tab
function getSessionId() {
  let id = sessionStorage.getItem("analytics_session");
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("analytics_session", id);
  }
  return id;
}

function getUserInfo() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) return { userType: "public", userId: null };
    return {
      userType: user.role === "admin" ? "admin" : "client",
      userId: user._id || user.id || null,
    };
  } catch {
    return { userType: "public", userId: null };
  }
}

export async function trackEvent({ eventType, pagePath, pageSection, props = {} }) {
  try {
    const { userType, userId } = getUserInfo();
    if (userType === "admin") return;
    await fetch(`${API_BASE}/api/analytics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType,
        pagePath,
        pageSection,
        userType,
        userId,
        sessionId: getSessionId(),
        props,
      }),
    });
  } catch {
    // analytics should never break the app
  }
}

export function trackPageView(pagePath, pageSection) {
  return trackEvent({ eventType: "page_view", pagePath, pageSection });
}