const mongoose = require("mongoose");

const AnalyticsEventSchema = new mongoose.Schema(
  {
    ts: {
      type: Date,
      default: Date.now,
      index: true
    },

    eventType: {
      type: String,
      required: true,
      enum: [
        "page_view",
        "login_success",
        "login_failure",
        "register_submit",
        "contact_submit",
        "doc_upload",
        "doc_download",
        "quiz_submit",
        "blog_post_view"
      ],
      index: true
    },

    page: {
      path: { type: String, index: true },
      section: { type: String }
    },

    userType: {
      type: String,
      enum: ["public", "client", "admin"],
      default: "public",
      index: true
    },

    userId: {
      type: String // optional
    },

    device: {
      type: String,
      enum: ["desktop", "mobile", "tablet", "unknown"],
      default: "unknown",
      index: true
    },

    sessionId: {
      type: String,
      index: true
    },

    props: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { collection: "analytics_events" }
);


AnalyticsEventSchema.index({ eventType: 1, ts: -1 });
AnalyticsEventSchema.index({ "page.section": 1, ts: -1 });
AnalyticsEventSchema.index({ device: 1, ts: -1 });

module.exports = mongoose.model("AnalyticsEvent", AnalyticsEventSchema);