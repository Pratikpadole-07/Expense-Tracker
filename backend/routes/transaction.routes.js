const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const upload = require("../middleware/upload.middleware");



const {
  createTransaction,
  getTransactions,
  getIncomeExpenseSummary,
  getCategorySummary,
  getMonthlySummary,
  getSummary,
   getRepeatSpending,
  exportTransactionsCSV,
  exportTransactionsPDF
 
} = require("../controllers/transaction.controller");


console.log("TRANSACTION CONTROLLERS:", {
  createTransaction,
  getTransactions,
  getIncomeExpenseSummary,
  getCategorySummary,
  getMonthlySummary,
  getSummary,
  exportTransactionsCSV,
  exportTransactionsPDF
});

/* TRANSACTIONS */
router.post("/", auth, upload.single("receipt"), createTransaction);
router.get("/", auth, getTransactions);


router.get("/repeat-spending",auth,getRepeatSpending);
/* ANALYTICS */
router.get("/summary", auth, getSummary);
router.get("/summary/income-expense", auth, getIncomeExpenseSummary);
router.get("/summary/category", auth, getCategorySummary);
router.get("/summary/monthly", auth, getMonthlySummary);


/* EXPORTS */
router.get("/export/csv", auth, exportTransactionsCSV);
router.get("/export/pdf", auth, exportTransactionsPDF);

module.exports = router;
