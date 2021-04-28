const express = require("express");
const userController = require("../Controllers/userController");
const passport = require("passport");
const router = express.Router();
const authMid = passport.authenticate("jwt", { session: false });

router.post("/register", userController.register);
router.post("/logIn", userController.logIn);
// router.get("/", userController.protect, userController.getUser);
router.get("/", authMid, userController.getUser);
router.put(
  "/changePassword",
  userController.protect,
  userController.changePassword
);
module.exports = router;
