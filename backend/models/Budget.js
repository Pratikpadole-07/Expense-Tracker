const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    category: {
      type: String,
      required: true
    },
    month: {
      type: String, // YYYY-MM
      required: true
    },
    limit: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

// One budget per user, category, month
budgetSchema.index(
  { userId: 1, category: 1, month: 1 },
  { unique: true }
);

module.exports = mongoose.model("Budget", budgetSchema);
