const User = require("../Models/usermodel.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { JWT_SECRET } = require("../Utls/config.js");
const { Sendmail } = require("../Utls/nodemailer.js");

const signupSchema = Joi.object({
  username: Joi.string().required(),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("user","shop", "admin"),
});

const signinSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const updateSchema = Joi.object({
  username: Joi.string().optional(),
  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  role: Joi.string().valid("user","shop", "admin"),
});

const signup = async (req, res) => {
  try {
    const { value, error } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const { username, phone, email, password, role } = value;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User Already Exist" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      phone,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );
    await Sendmail(
      email,
      "WELCOME TO SAFARMEAL",
      `
<table width="100%" cellpadding="0" cellspacing="0" border="0" 
  style="font-family: Arial, sans-serif; background:#f7fef7; padding:30px 0;">
  <tr>
    <td align="center">

      <table width="600" cellpadding="0" cellspacing="0" border="0" 
        style="background:#ffffff; border-radius:12px; overflow:hidden; 
        box-shadow:0 4px 14px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#ff7043; color:white; padding:22px; text-align:center;">
            <h1 style="margin:0; font-size:26px;">Welcome to SAFARMEAL 🍽️</h1>
          </td>
        </tr>

        <!-- Hero Image -->
        <tr>
          <td style="text-align:center; background:#fff;">
            <img src="https://assets.designtemplate.io/fri-jan-13-2023-4-06-am63094.webp" 
              alt="Delicious Food" width="100%" 
              style="max-height:260px; object-fit:cover;">
          </td>
        </tr>

        <!-- Main Content -->
        <tr>
          <td style="padding:28px; color:#333;">
            <p style="font-size:18px; margin:0 0 10px;">Hello, ${newUser.username} 👋</p>

            <p style="font-size:16px; margin:0 0 15px;">
              We’re thrilled to welcome you to <strong>SAFARMEAL</strong>, your new destination 
              for fresh flavors, fast delivery, and mouth-watering meals.
            </p>

            <p style="font-size:16px; margin:0 0 20px;">
              Explore our chef-curated menu and enjoy exclusive first-order discounts!
            </p>

            <center style="margin:30px 0;">
              <a href="https://google.com" 
                style="background:#ff7043; color:white; padding:14px 32px; 
                text-decoration:none; border-radius:8px; font-weight:bold; 
                font-size:16px; display:inline-block;">
                🍕 Order Your First Meal
              </a>
            </center>
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td style="padding:0 28px;">
            <hr style="border:none; border-top:1px solid #e0e0e0; margin:25px 0;"/>
          </td>
        </tr>

        <!-- Benefits Section -->
        <tr>
          <td style="padding:0 28px 28px; color:#555; font-size:14px; line-height:1.6;">
            <p>🥗 Fresh ingredients cooked daily</p>
            <p>⏱ Lightning-fast delivery</p>
            <p>⭐ Loved by foodies across the city</p>
            <p>💰 Exclusive deals every week</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#fff7ec; text-align:center; padding:20px; font-size:13px; color:#666;">
            <p style="margin:0 0 10px;">Warm Regards,<br/><strong>The SAFARMEAL Team</strong></p>
            <p style="margin:0;">📍 410 Adintah Arcade,Honeypark Road,Adajan, Surat, India</p>

            <p style="margin:12px 0 0;">
              <a href="#" style="color:#ef6c00; margin:0 8px; text-decoration:none;">Facebook</a> |
              <a href="#" style="color:#ef6c00; margin:0 8px; text-decoration:none;">Twitter</a> |
              <a href="#" style="color:#ef6c00; margin:0 8px; text-decoration:none;">Instagram</a>
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
`
    );
    res.status(201).json({
      message: "User Registered Successfully",
      data: {
        id: newUser._id,
        username: newUser.username,
        phone: newUser.phone,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Cannot register user" });
  }
};

const signin = async (req, res) => {
  try {
    const { error } = signinSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.status(200).json({
      message: "Loign Successfull",
      token,
      userID: user._id,
      role: user.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateuser = async (req, res) => {
  try {
    const { error } = updateSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { id } = req.params;

    const updateData = { ...req.body };

    if (updateData.password) {
      const hashedPassword = await bcrypt.hash(updateData.password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res
      .status(200)
      .json({ message: "User updated successfully", data: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getuserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User fetched successfully", data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getallusers = async (req, res) => {
  try {
    const users = await User.find();
    res
      .status(200)
      .json({ message: "Users fetched successfully", data: users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const forgotpassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();

    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 MIN
    await user.save();

    await Sendmail(
      user.email,
      "Your Password Reset OTP",
      `
      <p>Hello ${user.username},</p>
      <p>Your OTP for password reset is:</p>
      <h2>${otp}</h2>
      <p>Valid for 10 minutes.</p>
      `
    );

    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
const resetpassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password)
      return res.status(400).json({ message: "Email, OTP, and password are required" });

    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    await Sendmail(
      user.email,
      "Password Reset Successful",
      `
      <h2>Hello ${user.username},</h2>
      <p>Your password has been reset successfully.</p>
      <p>If you did not perform this action, contact support immediately.</p>
      `
    );

    return res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
const authverify = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "User is authenticated",
      user: req.user, // clean naming
    });
  } catch (error) {
    console.error("authverify error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  signup,
  signin,
  updateuser,
  getuserById,
  getallusers,
  deleteUser,
  forgotpassword,
  verifyOtp,
  resetpassword,
  authverify
};
