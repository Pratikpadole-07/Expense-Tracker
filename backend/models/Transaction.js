const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    type: {
      type: String,
      enum: ["income", "expense"],
      required: true
    },

    amount: {
      type: Number,
      required: true,
      min: [0.01, "Amount must be greater than zero"]
    },

    category: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    date: {
      type: Date,
      required: true,
      index: true
    },

    receiptUrl: {
      type: String
    }
  },
  { timestamps: true }
);

/* =========================
   INDEXES (CRITICAL)
   ========================= */

// used for budget + monthly analytics
transactionSchema.index({ userId: 1, date: 1 });

// used for category summaries
transactionSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model("Transaction", transactionSchema);
