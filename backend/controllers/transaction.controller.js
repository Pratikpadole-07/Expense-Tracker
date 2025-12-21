const Transaction = require("../models/Transaction");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");

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
        userId: req.user.id
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
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1
      }
    }
  ]);

  res.json(summary);
};

exports.getCategorySummary = async (req, res) => {
  const summary = await Transaction.aggregate([
    {
      $match: {
        userId: req.user.id,
        type: "expense"
      }
    },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" }
      }
    },
    {
      $sort: { total: -1 }
    }
  ]);

  res.json(summary);
};


exports.getIncomeExpenseSummary = async (req, res) => {
  const summary = await Transaction.aggregate([
    {
      $match: {
        userId: req.user.id
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

  const doc = new PDFDocument({ margin: 40, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=transactions.pdf"
  );

  doc.pipe(res);

  // Title
  doc.fontSize(18).text("Expense Tracker Report", { align: "center" });
  doc.moveDown();

  // Table Header
  doc.fontSize(12);
  doc.text("Date", 40);
  doc.text("Type", 120);
  doc.text("Category", 200);
  doc.text("Amount", 320);
  doc.text("Description", 400);
  doc.moveDown();

  doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);

  // Table Rows
  transactions.forEach(t => {
    doc.text(t.date.toISOString().split("T")[0], 40);
    doc.text(t.type, 120);
    doc.text(t.category, 200);
    doc.text(t.amount.toString(), 320);
    doc.text(t.description || "-", 400);
    doc.moveDown();
  });

  doc.end();
};
