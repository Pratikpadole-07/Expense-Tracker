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

    if (!type || !amount || !category || !date) {
      return res.status(400).json({ message: "Missing fields" });
    }

    let receiptUrl = null;

    // handle receipt upload
    if (req.file) {
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "expense-receipts" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(req.file.buffer);
      });

      receiptUrl = uploadResult.secure_url;
    }

    const transaction = await Transaction.create({
      userId: new mongoose.Types.ObjectId(req.user.id),
      type,
      amount: Number(amount),
      category,
      description,
      date: new Date(date),
      receiptUrl
    });

    res.status(201).json(transaction);
  } catch (err) {
    console.error("CREATE TRANSACTION ERROR:", err);
    res.status(500).json({ message: "Failed to create transaction" });
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
  if (category) query.category = category;

  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = new Date(from);
    if (to) query.date.$lte = new Date(to);
  }

  const transactions = await Transaction.find(query)
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json(transactions);
};

/* =========================
   AGGREGATIONS
   ========================= */
exports.getIncomeExpenseSummary = async (req, res) => {
  const summary = await Transaction.aggregate([
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
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" }
      }
    }
  ]);

  res.json(summary);
};

exports.getMonthlySummary = async (req, res) => {
  const summary = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(req.user.id)
      }
    },
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

/* =========================
   CSV EXPORT
   ========================= */
exports.exportTransactionsCSV = async (req, res) => {
  const { from, to, type, category } = req.query;

  const query = {
    userId: new mongoose.Types.ObjectId(req.user.id)
  };

  if (type) query.type = type;
  if (category) query.category = category;

  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = new Date(from);
    if (to) query.date.$lte = new Date(to);
  }

  const transactions = await Transaction.find(query).sort({ date: -1 }).lean();

  const fields = [
    { label: "Date", value: row => row.date.toISOString().split("T")[0] },
    { label: "Type", value: "type" },
    { label: "Category", value: "category" },
    { label: "Amount", value: "amount" },
    { label: "Description", value: "description" }
  ];

  const parser = new Parser({ fields });
  const csv = parser.parse(transactions);

  res.header("Content-Type", "text/csv");
  res.attachment("transactions.csv");
  res.send(csv);
};

/* =========================
   PDF EXPORT
   ========================= */
exports.exportTransactionsPDF = async (req, res) => {
  const { from, to, type, category } = req.query;

  const query = {
    userId: new mongoose.Types.ObjectId(req.user.id)
  };

  if (type) query.type = type;
  if (category) query.category = category;

  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = new Date(from);
    if (to) query.date.$lte = new Date(to);
  }

  const transactions = await Transaction.find(query).sort({ date: -1 }).lean();

  const doc = new PDFDocument({ size: "A4", margin: 40 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=expense-report.pdf");

  doc.pipe(res);

  doc.fontSize(20).text("Expense Tracker Report", { align: "center" });
  doc.moveDown();

  let y = doc.y + 10;
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach(t => {
    if (y > 750) {
      doc.addPage();
      y = 50;
    }

    doc.fontSize(10);
    doc.text(new Date(t.date).toLocaleDateString(), 40, y);
    doc.text(t.type, 120, y);
    doc.text(t.category, 200, y);
    doc.text(`Rs. ${t.amount}`, 300, y);
    doc.text(t.description || "-", 370, y, { width: 170 });

    if (t.type === "income") totalIncome += t.amount;
    else totalExpense += t.amount;

    y += 18;
  });

  doc.moveDown();
  doc.fontSize(12).text(`Total Income: Rs. ${totalIncome}`);
  doc.text(`Total Expense: Rs. ${totalExpense}`);
  doc.text(`Balance: Rs. ${totalIncome - totalExpense}`);

  doc.end();
};
