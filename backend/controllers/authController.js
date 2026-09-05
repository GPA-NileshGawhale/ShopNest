const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPToUser = async (user) => {
  const otp = generateOTP();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  user.otp = otp;
  user.otpExpiry = otpExpiry;
  user.verified = false;
  await user.save();

  const message = `
Welcome to ShopNest, ${user.name}!

Thank you for registering with us. To complete your registration, please use the following One-Time Password (OTP):

OTP: ${otp}

This code is valid for 5 minutes only.

If you did not request this, please ignore this email.
`;

  await sendEmail(user.email, "ShopNest - Your Registration OTP", message);
  return otp;
};

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please provide name, email, and password" });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      verified: false,
    });

    await sendOTPToUser(user);

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      message: "Registration successful. Please verify your OTP sent to your email.",
      otpExpiresInMinutes: 5,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ message: "No OTP found. Please request a new one." });
    }

    const expiryTime = new Date(user.otpExpiry).getTime();
    if (Date.now() > expiryTime) {
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
      return res.status(400).json({ message: "OTP expired. Please request a new OTP." });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.verified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      verified: true,
      token: generateToken(user._id),
      message: "Email verified successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const resendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verified) {
      return res.status(400).json({ message: "User already verified" });
    }

    await sendOTPToUser(user);

    res.status(200).json({
      message: "A new OTP has been sent to your email. It is valid for 5 minutes.",
      otpExpiresInMinutes: 5,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const sendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.verified) {
      return res.status(400).json({ message: "User already verified" });
    }

    await sendOTPToUser(user);

    return res.status(200).json({
      message: "OTP sent successfully. It is valid for 5 minutes.",
      otpExpiresInMinutes: 5,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user && (await bcrypt.compare(password, user.password))) {
      if (!user.verified) {
        return res.status(403).json({ message: "Please verify your email before logging in." });
      }

      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    }

    return res.status(401).json({ message: "Invalid email or password" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.find({}).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUser,
  verifyOTP,
  resendOTP,
  sendOTP,
};
