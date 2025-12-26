const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

const {
  register,
  login,
  getMe
} = require("../controllers/auth.controller");

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, getMe);

module.exports = router;
