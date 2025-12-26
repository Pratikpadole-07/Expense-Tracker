const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const { getRiskScore } = require("../controllers/insights.controller");

router.get("/risk-score", auth, getRiskScore);

module.exports = router;
