const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

exports.sendOTPEmail = async (email, otp, name) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'godsanju21@gmail.com',
      to: email,
      subject: 'Your TravelCRM Login OTP',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',sans-serif;">
          <div style="max-width:480px;margin:40px auto;background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">
            <div style="background:linear-gradient(135deg,#0ea5e9,#6366f1);padding:32px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">TravelCRM</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Enterprise Lead Management</p>
            </div>
            <div style="padding:36px 32px;">
              <p style="color:#94a3b8;font-size:14px;margin:0 0 8px;">Hello, ${name}</p>
              <p style="color:#e2e8f0;font-size:16px;margin:0 0 28px;line-height:1.6;">
                Your one-time login verification code is:
              </p>
              <div style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
                <span style="font-size:42px;font-weight:800;letter-spacing:12px;color:#0ea5e9;font-family:monospace;">${otp}</span>
              </div>
              <p style="color:#64748b;font-size:13px;margin:0 0 8px;">
                This code expires in <strong style="color:#94a3b8;">10 minutes</strong>.
              </p>
              <p style="color:#64748b;font-size:13px;margin:0;">
                If you did not request this, please ignore this email.
              </p>
            </div>
            <div style="padding:16px 32px;border-top:1px solid #1e293b;text-align:center;">
              <p style="color:#334155;font-size:12px;margin:0;">TravelCRM Enterprise &copy; ${new Date().getFullYear()}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};
