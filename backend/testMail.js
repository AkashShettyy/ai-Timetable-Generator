import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: "pramukh.p1404@gmail.com",
  subject: "Test OTP",
  text: "This is a test email.",
})
  .then(() => console.log("✅ Test email sent successfully"))
  .catch((err) => console.error("❌ Failed:", err));
