const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "complete", "failed"],
      default: "pending",
    },
    // this will hold the full SEO report once the job is done
    report: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    // if something goes wrong, save the error message here
    error: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  },
);

module.exports = mongoose.model("Job", jobSchema);
