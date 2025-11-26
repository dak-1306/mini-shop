import crypto from "crypto";
import User from "../models/users.js";
import { sendVerificationEmail } from "../services/email.service.js"; // tạo placeholder/service riêng

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "name, email, password required" });
    if (password.length < 8)
      return res.status(400).json({ error: "password min 8 chars" });

    const normalizedEmail = String(email).trim().toLowerCase();

    // check existing
    const exists = await User.findOne({ email: normalizedEmail }).lean().exec();
    if (exists)
      return res.status(409).json({ error: "Email already registered" });

    // NOTE: Bỏ việc hash password ở controller để tránh double-hash.
    // Việc hash sẽ do UserSchema.pre('save') xử lý trong models/users.js
    const user = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password, // để plain — model sẽ hash trước khi lưu
      isVerified: false,
    });

    // create email verification token (store hashed token)
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    // store on user (ensure fields exist in User model)
    user.emailVerifyToken = tokenHash;
    user.emailVerifyExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h
    await user.save();

    // send verification email asynchronously (implement sendVerificationEmail)
    sendVerificationEmail(user.email, { token, userId: user._id }).catch(
      (err) => console.error("send email failed", err)
    );

    return res
      .status(201)
      .json({ message: "Registered. Check your email to verify." });
  } catch (err) {
    // handle duplicate key race (in case unique index triggered)
    if (err?.code === 11000)
      return res.status(409).json({ error: "Email already registered" });
    console.error("register error", err);
    return res.status(500).json({ error: "Registration failed" });
  }
}
