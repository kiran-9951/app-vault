const UserModel = require("../models/user_schema");
const OtpModel = require("../models/otp_schema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require('express-validator');
const { sendOtpEmail, sendSuccessLogin, sendForgotPasswordEmail } = require("../services/email");

// Register: expects name, email, password in req.body, optional image in req.file. Sends OTP email.
const register = async (req, res) => {
  await body('name').notEmpty().withMessage('Name is required').run(req);
  await body('email').isEmail().withMessage('Valid email is required').run(req);
  await body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters').run(req);

  const errors = validationResult(req);
if (!errors.isEmpty()) {
  const errorMessages = errors.array().map(err => err.msg); 
  return res.status(400).json({ errors: errorMessages });
}

  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }
    const image_url = req.file ? req.file.path : null;
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists." });
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    await sendOtpEmail(email, otp);
    const expires_at = new Date(Date.now() + 5 * 60 * 1000);
    const saveOtp = new OtpModel({ email, otp, expires_at });
    await saveOtp.save();
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new UserModel({ name, email, password: hashedPassword, image: image_url });
    await user.save();
    res.status(201).json({ message: "Registered successfully", otp_sent: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Resend OTP: expects email in req.body. Sends new OTP email and updates expires_at.
const resendOtp = async (req, res) => {
  await body('email').isEmail().withMessage('Valid email is required').run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Please enter the email" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expires_at = new Date(Date.now() + 5 * 60 * 1000);
    await sendOtpEmail(email, otp);
    await OtpModel.findOneAndUpdate(
      { email },
      { $set: { otp, expires_at } },
      { upsert: true, new: true }
    );
    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Verify OTP: expects email and otp in req.body. Validates OTP and expiry, returns a short-lived OTP verification token.
const verifyOtp = async (req, res) => {
   await body('email').isEmail().withMessage('Valid email is required').run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }
    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: "User not found" });
    }
    const userOtp = await OtpModel.findOne({ email, otp });
    if (!userOtp || userOtp.otp !== Number(otp) || userOtp.expires_at < new Date()) {
      return res.status(400).json({ message: "OTP invalid or expired" });
    }
    await UserModel.updateOne({ email }, { $set: { is_verified: true } });
    const loginToken = jwt.sign({ email: existingUser.email }, process.env.VERIFY_OTP_SECRET_KEY, { expiresIn: "5m" });
    res.status(200).json({ message: "OTP verified successfully", token: loginToken });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login: expects password in req.body and email from req.email set by verifyOtpToken middleware. Returns access and refresh tokens.
const Login = async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.email;
    if (!password) {
      return res.status(400).json({ message: "Please enter the password" });
    }
    const existingUser = await UserModel.findOne({ email });
    if (!existingUser || existingUser.is_verified === false) {
      return res.status(400).json({ message: "Email not found or User email is not verified" });
    }
    const checkPassword = await bcrypt.compare(password, existingUser.password);
    if (!checkPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }
    await sendSuccessLogin(email);
    const accessToken = jwt.sign({ email: existingUser.email, role: existingUser.role }, process.env.VERIFY_USER_SECRETKEY, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ email: existingUser.email }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "30d" });
    existingUser.refreshToken = refreshToken;
    await existingUser.save();
    res.status(200).json({ message: "Login successful", accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Forgot Password: expects email from req.email set by verifyUser middleware. Sends a new OTP for password reset.
const forgotPassword = async (req, res) => {
  try {
    const email = req.email;
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expires_at = new Date(Date.now() + 5 * 60 * 1000);
    await sendForgotPasswordEmail(email, otp);
    await OtpModel.findOneAndUpdate(
      { email },
      { $set: { otp: otp, expires_at: expires_at } },
      { upsert: true }
    );
    return res.status(200).json({ message: "Forgot password OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update New Password: expects email from req.email set by verifyUser middleware and newPassword in req.body. Updates password.
const updateNewPassword = async (req, res) => {
  try {
    const email = req.email;
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ message: "Please provide a new password" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await UserModel.findOneAndUpdate({ email }, { $set: { password: hashedPassword } });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Refresh Token: expects refresh token in req.body.token. Returns new access token if valid.
const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Refresh token is required" });
    }
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const email = decoded.email;
    const user = await UserModel.findOne({ email });
    if (!user || !user.refreshToken || user.refreshToken !== token) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }
    const newAccessToken = jwt.sign({ email: user.email, role: user.role }, process.env.VERIFY_USER_SECRETKEY, { expiresIn: "1h" });
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired refresh token", error: error.message });
  }
};

// Logout: expects email from req.email set by verifyUser middleware. Clears refresh token.
const Logout = async (req, res) => {
  try {
    const email = req.email
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.refreshToken = null;
    await user.save();
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { register, resendOtp, verifyOtp, Login, forgotPassword, updateNewPassword, Logout, refreshToken };
