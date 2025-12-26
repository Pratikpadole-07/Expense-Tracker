const Transaction = require("../models/Transaction");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");
const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinary");

/* =========================
   CREATE TRANSACTION
   ========================= */
exports.createTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;

    // presence validation
    if (!type || amount == null || !category || !date) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // type validation
    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    // amount validation
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than zero" });
    }

    const normalizedCategory = category.trim();

    let receiptUrl = null;

    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "expense-receipts" }, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          })
          .end(req.file.buffer);
      });

      receiptUrl = uploadResult.secure_url;
    }

    const transaction = await Transaction.create({
      userId: new mongoose.Types.ObjectId(req.user.id),
      type,
      amount: numericAmount,
      category: normalizedCategory,
      description,
      date: new Date(date),
      receiptUrl
    });

    return res.status(201).json(transaction);
  } catch (err) {
    console.error("CREATE TRANSACTION ERROR:", err);
    return res.status(500).json({ message: "Failed to create transaction" });
  }
};

/* =========================
   GET TRANSACTIONS
   ========================= */
exports.getTransactions = async (req, res) => {
  const { from, to, type, category, page = 1, limit = 10 } = req.query;

  const query = {
    userId: new mongoose.Types.ObjectId(req.user.id)
  };

  if (type) query.type = type;
  if (category) query.category = category.trim();

  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = new Date(from);
    if (to) query.date.$lte = new Date(to);
  }

  const transactions = await Transaction.find(query)
    .sort({ date: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  res.json(transactions);
};

/* =========================
   SUMMARY (USED BY DASHBOARD)
   ========================= */
exports.getSummary = async (req, res) => {
  try {
    const data = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id)
        }
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" }
        }
      }
    ]);

    let income = 0;
    let expense = 0;

    data.forEach(d => {
      if (d._id === "income") income = d.total;
      if (d._id === "expense") expense = d.total;
    });

    res.json({
      income,
      expense,
      balance: income - expense
    });
  } catch (err) {
    console.error("SUMMARY ERROR:", err);
    res.status(500).json({ message: "Failed to load summary" });
  }
};

/* =========================
   AGGREGATIONS
   ========================= */
exports.getIncomeExpenseSummary = async (req, res) => {
  const summary = await Transaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
    { $group: { _id: "$type", total: { $sum: "$amount" } } }
  ]);

  res.json(summary);
};

exports.getCategorySummary = async (req, res) => {
  const summary = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(req.user.id),
        type: "expense"
      }
    },
    { $group: { _id: "$category", total: { $sum: "$amount" } } }
  ]);

  res.json(summary);
};

exports.getMonthlySummary = async (req, res) => {
  const summary = await Transaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          type: "$type"
        },
        total: { $sum: "$amount" }
      }
    }
  ]);

  res.json(summary);
};


exports.exportTransactionsCSV = async (req, res) => {
  try {
    const { from, to, type, category } = req.query;

    const query = { userId: new mongoose.Types.ObjectId(req.user.id) };

    if (type) query.type = type;
    if (category) query.category = category.trim();

    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .lean();

    const fields = [
      { label: "Date", value: row => row.date.toISOString().split("T")[0] },
      { label: "Type", value: "type" },
      { label: "Category", value: "category" },
      { label: "Amount", value: "amount" },
      { label: "Description", value: "description" }
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(transactions);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=transactions.csv");
    res.status(200).send(csv);
  } catch (err) {
    console.error("CSV EXPORT ERROR:", err);
    res.status(500).json({ message: "Failed to export CSV" });
  }
};


exports.exportTransactionsPDF = async (req, res) => {
  try {
    const { from, to, type, category } = req.query;

    const query = { userId: new mongoose.Types.ObjectId(req.user.id) };

    if (type) query.type = type;
    if (category) query.category = category.trim();

    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .lean();

    const doc = new PDFDocument({ size: "A4", margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=expense-report.pdf"
    );

    doc.pipe(res);

    doc.fontSize(20).text("Expense Report", { align: "center" });
    doc.moveDown();

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
      doc.fontSize(10).text(
        `${new Date(t.date).toLocaleDateString()} | ${t.type} | ${t.category} | ₹${t.amount}`
      );

      if (t.type === "income") totalIncome += t.amount;
      else totalExpense += t.amount;
    });

    doc.moveDown();
    doc.fontSize(12).text(`Total Income: ₹${totalIncome}`);
    doc.text(`Total Expense: ₹${totalExpense}`);
    doc.text(`Balance: ₹${totalIncome - totalExpense}`);

    doc.end();
  } catch (err) {
    console.error("PDF EXPORT ERROR:", err);
    res.status(500).json({ message: "Failed to export PDF" });
  }
};

/* =========================
   REPEAT SPENDING INTELLIGENCE
   ========================= */
exports.getRepeatSpending = async (req, res) => {
  try {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const data = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
          type: "expense",
          date: { $gte: start, $lt: end }
        }
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          avgAmount: { $avg: "$amount" }
        }
      },
      {
        $match: {
          count: { $gte: 3 }
        }
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          count: 1,
          totalAmount: 1,
          avgAmount: 1
        }
      }
    ]);

    res.json(data);
  } catch (err) {
    console.error("REPEAT SPENDING ERROR:", err);
    res.status(500).json({ message: "Failed to analyze spending" });
  }
};
