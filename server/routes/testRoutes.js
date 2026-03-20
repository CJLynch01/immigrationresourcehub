const express = require("express");
const router = express.Router();
const trackEvent = require("../utils/trackEvent");

router.get("/test-analytics", async (req, res) => {
  await trackEvent({
    eventType: "page_view",
    pagePath: "/services",
    pageSection: "Services",
    userType: "public",
    device: "desktop"
  });

  res.send("Analytics logged successfully");
});

module.exports = router;