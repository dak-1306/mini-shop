/**
 * Service gửi email đơn giản dùng trong auth.controller.register
 *
 * Hành vi:
 * - Nếu cấu hình SMTP (SMTP_HOST) có trong env => dùng nodemailer để gửi thực sự.
 * - Nếu không có cấu hình SMTP => chỉ log ra console (dev mode, không ném lỗi).
 *
 * Đầu vào:
 * - sendMail({ to, subject, text, html })
 * - sendVerificationEmail(to, { token, userId })
 *
 * Ghi chú:
 * - Controller gọi sendVerificationEmail(...).catch(...) — service không ném lỗi trong
 *   chế độ "no-SMTP" để tránh block flow đăng ký.
 * - Bạn có thể mở rộng: queue (Bull), template engine, tracking, v.v.
 */

import nodemailer from "nodemailer";
import { CLIENT_ORIGIN } from "../config/env.js";

const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 0;
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const FROM_EMAIL =
  process.env.EMAIL_FROM || `no-reply@${process.env.DOMAIN || "local"}`;

// Nếu có cấu hình SMTP, khởi tạo transporter nodemailer
let transporter = null;
if (SMTP_HOST) {
  try {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT || 587,
      secure: SMTP_PORT === 465, // true nếu dùng 465
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    });
  } catch (err) {
    // không ném lỗi ở đây để không làm hỏng khởi động app; ghi log để dev biết
    console.error("Failed to create email transporter:", err?.message || err);
    transporter = null;
  }
}

/**
 * Gửi email chung
 * - Trả về Promise; nếu không có transporter thì resolve và log (không ném).
 */
export async function sendMail({ to, subject, text = "", html = "" }) {
  if (!to) throw new Error("sendMail: 'to' is required");

  const msg = {
    from: FROM_EMAIL,
    to,
    subject,
    text,
    html,
  };

  if (!transporter) {
    // Dev fallback: chỉ log, không ném
    console.log("[email.service] SMTP not configured — email simulated:", {
      to,
      subject,
      text: text
        ? `${text.slice(0, 200)}${text.length > 200 ? "..." : ""}`
        : undefined,
      html: html
        ? `${html.slice(0, 200)}${html.length > 200 ? "..." : ""}`
        : undefined,
    });
    return Promise.resolve({ simulated: true });
  }

  try {
    const info = await transporter.sendMail(msg);
    // log ngắn gọn
    console.log(
      `[email.service] Sent email to ${to} messageId=${info.messageId}`
    );
    return info;
  } catch (err) {
    // Ghi log và rethrow để caller có thể xử lý; controller đang gọi .catch(...)
    console.error("[email.service] sendMail error:", err?.message || err);
    throw err;
  }
}

/**
 * Tạo URL verify email
 * - Có thể tùy chỉnh đường dẫn verify ở client (ví dụ /verify-email)
 */
function buildVerifyUrl(token, userId) {
  const base = (CLIENT_ORIGIN || "").replace(/\/$/, "");
  // client route: /verify-email?token=...&id=...
  return `${
    base || "http://localhost:5173"
  }/verify-email?token=${encodeURIComponent(token)}&id=${encodeURIComponent(
    String(userId)
  )}`;
}

/**
 * Gửi email xác thực (verification)
 * - Tham số `meta` có thể mở rộng (tên user, locale, ...)
 * - Service trả về Promise; controller đã xử lý .catch(...)
 */
export async function sendVerificationEmail(to, { token, userId, name } = {}) {
  const url = buildVerifyUrl(token, userId);
  const subject = "Xác thực email của bạn";
  const plain = `Xin chào${name ? " " + name : ""},

Vui lòng xác thực email của bạn bằng cách truy cập đường dẫn sau:

${url}

Link sẽ hết hạn trong 24 giờ.

Nếu bạn không yêu cầu việc này, bỏ qua email này.
`;
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif">
      <p>Xin chào${name ? " " + name : ""},</p>
      <p>Vui lòng nhấn nút bên dưới để xác thực địa chỉ email của bạn. Link sẽ hết hạn trong 24 giờ.</p>
      <p><a href="${url}" style="display:inline-block;padding:10px 16px;background:#0b72ff;color:#fff;border-radius:6px;text-decoration:none">Xác thực email</a></p>
      <p>Nếu nút không hoạt động, bạn có thể dùng đường dẫn sau:<br/><a href="${url}">${url}</a></p>
      <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
      <hr/>
      <small>Sending from ${FROM_EMAIL}</small>
    </div>
  `;

  // không ném trong chế độ dev/no-SMTP — caller có thể quyết định
  return sendMail({ to, subject, text: plain, html });
}

export default {
  sendMail,
  sendVerificationEmail,
};
