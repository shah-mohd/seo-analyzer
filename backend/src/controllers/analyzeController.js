const Job = require("../models/Job");
const { addJobToQueue } = require("../jobs/queue");

function isValidUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (error) {
    return false;
  }
}

async function startAnalysis(req, res) {
  const { url } = req.body;
  console.log(url);

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({
      message: "Please provide a valid URL",
    });
  }

  try {
    const job = await Job.create({ url, status: "pending" });

    addJobToQueue(job._id.toString());

    res.status(202).json({
      jobId: job._id,
      status: job.status,
      message: "Analysis started. Check /api/results/:id for progress.",
    });
  } catch (error) {
    console.error("Failed to start analysis:", error.message);
    res
      .status(500)
      .json({ message: "Something went wrong starting the analysis" });
  }
}

module.exports = { startAnalysis };
