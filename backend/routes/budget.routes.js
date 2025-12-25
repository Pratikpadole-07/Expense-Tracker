const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const {
  setBudget,
  getBudgetStatus
} = require("../controllers/budget.controller");
router.get("/test", (req, res) => {
  res.send("budget route working");
});

router.post("/", auth, setBudget);
router.get("/status", auth, getBudgetStatus);

module.exports = router;
