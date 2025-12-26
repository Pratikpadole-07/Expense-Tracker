require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/transactions", require("./routes/transaction.routes"));
app.use("/api/budgets", require("./routes/budget.routes"));
app.get("/", (req, res) => {
  res.send("API running");
});
app.use("/api/insights", require("./routes/insights.routes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
