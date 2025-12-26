const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const mongoose = require("mongoose");

exports.getRiskScore = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysPassed = Math.max(
      1,
      Math.ceil((now - monthStart) / (1000 * 60 * 60 * 24))
    );
    const totalDays = monthEnd.getDate();

    /* -----------------------------
       1️⃣ BUDGET USAGE SCORE (0–50)
    ----------------------------- */
    const budgets = await Budget.find({ userId });

    let maxUsage = 0;
    let totalBudget = 0;

    for (const b of budgets) {
      totalBudget += b.limit;

      const spentAgg = await Transaction.aggregate([
        {
          $match: {
            userId,
            category: b.category,
            type: "expense",
            date: { $gte: monthStart, $lte: monthEnd }
          }
        },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);

      const spent = spentAgg[0]?.total || 0;
      const percentUsed = (spent / b.limit) * 100;

      if (percentUsed > maxUsage) maxUsage = percentUsed;
    }

    const budgetScore = Math.min(50, Math.round(maxUsage * 0.5));

    /* -----------------------------
       2️⃣ REPEAT SPENDING SCORE (0–30)
    ----------------------------- */
    const repeatAgg = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: "expense",
          date: { $gte: monthStart, $lte: monthEnd }
        }
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      {
        $match: { count: { $gte: 4 } }
      }
    ]);

    const repeatCount = repeatAgg.reduce((sum, r) => sum + r.count, 0);
    const repeatScore = Math.min(30, repeatCount * 3);

    /* -----------------------------
       3️⃣ EXPENSE VELOCITY SCORE (0–20)
    ----------------------------- */
    const expenseAgg = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: "expense",
          date: { $gte: monthStart, $lte: monthEnd }
        }
      },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalExpense = expenseAgg[0]?.total || 0;
    const avgDailySpend = totalExpense / daysPassed;
    const projectedSpend = avgDailySpend * totalDays;

    const velocityPercent =
      totalBudget > 0 ? (projectedSpend / totalBudget) * 100 : 0;

    const velocityScore = Math.min(20, Math.round(velocityPercent * 0.2));

    /* -----------------------------
       FINAL SCORE
    ----------------------------- */
    let score = budgetScore + repeatScore + velocityScore;
    score = Math.min(100, score);

    let level = "LOW";
    if (score >= 70) level = "HIGH";
    else if (score >= 40) level = "MEDIUM";

    res.json({
      score,
      level,
      signals: {
        budgetUsage: budgetScore,
        repeatSpending: repeatScore,
        velocity: velocityScore
      }
    });
  } catch (err) {
    console.error("RISK SCORE ERROR:", err);
    res.status(500).json({ message: "Failed to calculate risk score" });
  }
};
