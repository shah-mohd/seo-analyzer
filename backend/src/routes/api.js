const express = require("express");
const router = express.Router();

const { startAnalysis } = require("../controllers/analyzeController");
const { getResults } = require("../controllers/resultsController");

router.post("/analyze", startAnalysis);
router.get("/results/:id", getResults);

module.exports = router;
