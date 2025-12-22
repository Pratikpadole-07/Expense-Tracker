const Transaction = require("../models/Transaction");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");
const mongoose = require("mongoose");

exports.addTransaction = async (req, res) => {
  const { type, amount, category, description, date } = req.body;

  if (!type || !amount || !category || !date) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const transaction = await Transaction.create({
    userId: req.user.id,
    type,
    amount,
    category,
    description,
    date,
  });

  res.status(201).json(transaction);
};

exports.getTransactions = async (req, res) => {
  const { from, to, type, category, page = 1, limit = 10 } = req.query;

  const query = {
    userId: req.user.id
  };

  if (type) {
    query.type = type;
  }

  if (category) {
    query.category = category;
  }

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


exports.exportTransactionsCSV = async (req, res) => {
  const { from, to, type, category } = req.query;

  const query = { userId: req.user.id };

  if (type) query.type = type;
  if (category) query.category = category;

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

  res.header("Content-Type", "text/csv");
  res.attachment("transactions.csv");
  res.send(csv);
};


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

  /* ---------- HEADER ---------- */
  doc
    .fontSize(20)
    .text("Expense Tracker Report", { align: "center" });

  doc.moveDown(0.5);

  doc
    .fontSize(10)
    .fillColor("gray")
    .text(
      `Generated on: ${new Date().toLocaleDateString()}`,
      { align: "center" }
    );

  doc.moveDown();

  /* ---------- FILTER INFO ---------- */
  doc
    .fillColor("black")
    .fontSize(11)
    .text(
      `Filters: ${
        type || category || from || to
          ? `${type || "All"} | ${category || "All"} | ${from || "Any"} to ${to || "Any"}`
          : "None"
      }`
    );

  doc.moveDown();

  /* ---------- TABLE HEADER ---------- */
  const startY = doc.y;

  doc.fontSize(11).font("Helvetica-Bold");
  doc.text("Date", 40, startY);
  doc.text("Type", 110, startY);
  doc.text("Category", 170, startY);
  doc.text("Amount", 300, startY);
  doc.text("Description", 370, startY);

  doc.moveTo(40, startY + 15).lineTo(550, startY + 15).stroke();

  doc.font("Helvetica");

  /* ---------- TABLE ROWS ---------- */
  let y = startY + 25;
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach(t => {
    if (y > 750) {
      doc.addPage();
      y = 50;
    }

    doc.fontSize(10);
    doc.text(new Date(t.date).toLocaleDateString(), 40, y);
    doc.text(t.type, 110, y);
    doc.text(t.category, 170, y);
    doc.text(`Rs. ${t.amount}`, 300, y);
    doc.text(t.description || "-", 370, y, { width: 170 });

    if (t.type === "income") totalIncome += t.amount;
    else totalExpense += t.amount;

    y += 18;
  });

  /* ---------- TOTALS ---------- */
  doc.moveDown(2);
  doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();

  doc.font("Helvetica-Bold").fontSize(12);
  doc.text(`Total Income: Rs. ${totalIncome}`);
  doc.text(`Total Expense: Rs. ${totalExpense}`);
  doc.text(`Balance: Rs. ${totalIncome - totalExpense}`);

  doc.end();
};