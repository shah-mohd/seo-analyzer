const mongoose = require("mongoose");
const Job = require("../models/Job");

async function getResults(req, res) {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ message: "That doesn't look like a valid job ID" });
  }

  try {
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({ message: "No job found with that ID" });
    }

    res.json({
      jobId: job._id,
      url: job.url,
      status: job.status,
      report: job.report,
      error: job.error,
      createdAt: job.createdAt,
    });
  } catch (error) {
    console.error("Failed to fetch results:", error.message);
    res
      .status(500)
      .json({ message: "Something went wrong fetching the results" });
  }
}

module.exports = { getResults };
