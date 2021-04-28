const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models");

exports.register = async (req, res, next) => {
  try {
    const {
      username,
      password,
      confirmPassword,
      email,
      firstName,
      lastName,
      phoneNumber,
      gender,
    } = req.body;
    if (password !== confirmPassword)
      return res.status(400).json({ message: "password did not match" });
    const hashedPassword = await bcrypt.hash(password, 12);
    await User.create({
      username,
      password: hashedPassword,
      email,
      firstName,
      lastName,
      phoneNumber,
      gender,
    });
    res.status(201).json({ message: "register successfully" });
  } catch (err) {
    next(err);
  }
};

exports.logIn = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({
      where: { username },
      // attributes: ["password"],
    });
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (isPasswordMatch) {
      console.log("LOGIN SUCKCESS");
      const payload = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
      };
      const token = jwt.sign(payload, "secretkey", {
        expiresIn: +process.env.JWT_EXPIRES_IN,
      });
      res.status(200).json({ token, message: "login success" });
    } else {
      res.status(200).json({ message: "login failed" });
    }
  } catch (err) {
    next(err);
  }
};

exports.protect = async (req, res, next) => {
  try {
    let token = null;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
      console.log(token);
    } else {
      return res.status(401).json({ message: "unauthorized" });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY); // ถ้าโทเค่นผิดพลาด จะThrow error
    const user = await User.findOne({ where: { id: payload.id } }); //คืนข้อมูลตัวที่req
    if (!user) return res.status(400).json({ message: "user not found" });
    req.user = user;
    req.payload = payload;
    next();
  } catch (err) {
    next(err);
  }
};

exports.getUser = (req, res, next) => {
  res.status(200).json({ message: req.user, payload: req.payload });
};

exports.changePassword = async (req, res, next) => {
  const { username, oldPassword, newPassword } = req.body;
  const isOldPasswordCorrect = await bcrypt.compare(
    oldPassword,
    req.user.password
  );
  if (!isOldPasswordCorrect)
    return res.status(400).json({ message: "password is incorrect" });
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  req.user.password = hashedPassword;
  await req.user.save();
  // await User.update({ password: hashedPassword }, { where: { username } });
  res.status(200).json({ message: "update complete" });
};
