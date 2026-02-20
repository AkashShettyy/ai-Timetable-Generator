import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";
console.log("🔍 Email user:", process.env.EMAIL_USER);
console.log("🔍 Email pass:", process.env.EMAIL_PASS ? "Loaded ✅" : "Missing ❌");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send OTP
export const sendEmailOTP = async (email, otp) => {
  await transporter.sendMail({
    from: `"AI Timetable System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Email Verification OTP",
    html: `<h2>OTP Verification</h2><p>Your OTP is <b>${otp}</b>. It expires in 5 minutes.</p>`,
  });
};

// Send welcome email (based on role)
export const sendWelcomeEmail = async (user) => {
  const roleMsg =
    user.role === "faculty"
      ? "Thank you for registering as Faculty. Please wait for admin approval."
      : "Welcome to the AI Timetable System! Your account is ready.";

  await transporter.sendMail({
    from: `"AI Timetable System" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `Welcome ${user.role === "faculty" ? "Faculty" : "Student"}`,
    html: `<h3>Hello ${user.name},</h3><p>${roleMsg}</p>`,
  });
};

// Send email after faculty is approved
export const sendFacultyApprovedEmail = async (user) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"TEST MAIL" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Faculty Account Approved",
      html: `
        <h2>Hello ${user.name},</h2>
        <p>Your faculty account has been <b>approved</b> by the admin.</p>
        <p>You can now log in and start using the platform.</p>
        <br>
        <p>Thank you,<br>AI Timetable Admin Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Faculty approval email sent to ${user.email}`);
  } catch (error) {
    console.error("❌ Failed to send faculty approval email:", error.message);
  }
};

