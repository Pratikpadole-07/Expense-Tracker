const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");

/* =========================
   CREATE OR UPDATE BUDGET
   ========================= */
exports.setBudget = async (req, res) => {
  try {
    const { category, limit, month } = req.body;

    if (!category || limit == null || !month) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const budget = await Budget.findOneAndUpdate(
      {
        userId: req.user.id,
        category: category.trim(),
        month
      },
      {
        limit: Number(limit)
      },
      {
        upsert: true,
        new: true
      }
    );

    res.json(budget);
  } catch (err) {
    console.error("SET BUDGET ERROR:", err);
    res.status(500).json({ message: "Failed to set budget" });
  }
};

/* =========================
   GET BUDGET STATUS
   ========================= */
exports.getBudgetStatus = async (req, res) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ message: "Month required" });
    }

    const budgets = await Budget.find({
      userId: req.user.id,
      month
    }).lean();

    if (!budgets.length) {
      return res.json([]);
    }

    const start = new Date(`${month}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    const results = [];

    for (const budget of budgets) {
      const spentAgg = await Transaction.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(req.user.id),
            category: budget.category,
            type: "expense",
            date: {
              $gte: start,
              $lt: end
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" }
          }
        }
      ]);

      const spent = spentAgg.length ? spentAgg[0].total : 0;

      const percentUsed =
        budget.limit > 0
          ? Math.round((spent / budget.limit) * 100)
          : 0;

      results.push({
        category: budget.category,
        limit: budget.limit,
        spent,
        percentUsed,
        status:
          percentUsed >= 100
            ? "exceeded"
            : percentUsed >= 80
            ? "warning"
            : "ok"
      });
    }

    res.json(results);
  } catch (err) {
    console.error("GET BUDGET STATUS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch budget status" });
  }
};
