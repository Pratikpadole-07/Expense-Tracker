const express = require("express");
const {
  addTransaction,
  getTransactions,
  getMonthlySummary,
  getCategorySummary,
  getIncomeExpenseSummary,
  exportTransactionsCSV,
  exportTransactionsPDF
} = require("../controllers/transaction.controller");

const auth = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", auth, addTransaction);
router.get("/", auth, getTransactions);
router.get("/summary/monthly", auth, getMonthlySummary);
router.get("/summary/category", auth, getCategorySummary);
router.get("/summary/income-expense", auth, getIncomeExpenseSummary);
router.get("/export/csv", auth, exportTransactionsCSV);
router.get("/export/pdf", auth, exportTransactionsPDF);

module.exports = router;
