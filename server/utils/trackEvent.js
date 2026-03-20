const AnalyticsEvent = require("../models/analyticsevent");

const trackEvent = async ({
  eventType,
  pagePath,
  pageSection,
  userType = "public",
  userId = null,
  device = "unknown",
  sessionId = null,
  props = {}
}) => {
  try {
    await AnalyticsEvent.create({
      eventType,
      page: { path: pagePath, section: pageSection },
      userType,
      userId,
      device,
      sessionId,
      props
    });
  } catch (err) {
    console.error("Analytics error:", err.message);
  }
};

module.exports = trackEvent;