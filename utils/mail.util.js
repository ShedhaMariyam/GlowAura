import nodemailer from "nodemailer";

// Send OTP Email
export const sendVerificationEmail =async (email, otp)=> {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD
      }
    });

    const info = await transporter.sendMail({
      from: `"GlowAura Support" <${process.env.NODEMAILER_EMAIL}>`,
      to: email,
      subject: "GlowAura Email Verification Code",
      replyTo: "support@glowaura.com",
      headers: {
        "X-Mailer": "GlowAuraMailer",
        "X-Priority": "3"
      },
      text: `Your GlowAura OTP is: ${otp}. It expires in 1 minute.`,
      html: htmlContent(otp)
    });

    return info.accepted?.length > 0;

  } catch (error) {
    console.error("Error sending email", error);
    return false;
  }
}

function htmlContent(otp) {
  return `
    <div style="max-width:460px;margin:32px auto;font-family:'Inter','Segoe UI',sans-serif;background:#fff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.10);padding:32px;border:1px solid #eee;">
      <div style="text-align:center;">
        <h1 style="color:#2b2b2b;margin-bottom:6px;">GlowAura</h1>
        <div style="color:#4b5563;font-size:16px;margin-bottom:20px;">Your trusted online shopping partner</div>
        <h2 style="font-size:20px;font-weight:600;margin-bottom:12px;color:#2b2b2b;">Email Verification</h2>
        <div style="font-size:16px;color:#e9bba2;margin-bottom:18px;">
          Use the OTP below to verify your email.
        </div>
        <div style="display:inline-block;padding:20px 46px;background:#232d3b;border-radius:7px;font-size:32px;font-weight:700;letter-spacing:2px;color:#fff;margin-bottom:16px">
          ${otp}
        </div>
        <div style="font-size:15px;margin:14px 0 20px 0;color:#5a5a5a;">
          This code expires in <strong>1 minute</strong>. Don’t share it.
        </div>
        <hr style="margin:24px 0; border: none; border-top: 1px solid #eaeaea;">
        <div style="font-size:13px;color:#7a7a7a;">
          If you didn’t request this, ignore this email.<br>
          &copy; 2025 GlowAura. All rights reserved.
        </div>
      </div>
    </div>
  `;
}