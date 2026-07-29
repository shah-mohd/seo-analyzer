const Job = require("../models/Job");
const { analyzeSite } = require("../services/analyzeSite");

const queue = [];
let isProcessing = false;

// adds a job to the line
function addJobToQueue(jobId) {
  queue.push(jobId);
  processNextJob(); // try to start working on it right away
}

// works through the queue one job at a time
async function processNextJob() {
  if (isProcessing) return; // already working on something, don't start another
  if (queue.length === 0) return;

  isProcessing = true;
  const jobId = queue.shift();

  try {
    const job = await Job.findById(jobId);
    if (!job) throw new Error("Job not found");

    job.status = "processing";
    await job.save();

    const report = await analyzeSite(job.url);

    job.status = "complete";
    job.report = report;
    await job.save();

    console.log(`Job ${jobId} finished analyzing ${job.url}`);
  } catch (error) {
    console.error(`Job ${jobId} failed:`, error.message);

    await Job.findByIdAndUpdate(jobId, {
      status: "failed",
      error: error.message,
    });
  } finally {
    isProcessing = false;
    processNextJob(); // move on to the next job in line, if there is one
  }
}

module.exports = { addJobToQueue };
