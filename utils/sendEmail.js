const nodemailer = require("nodemailer");

const sendEmail = async (to, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: "Your RentMate Verification Code",
    html: `
            <div style="font-family: Arial; padding: 20px; text-align: center;">
                <h2>Welcome to RentMate!</h2>
                <p>Your one-time password (OTP) is:</p>
                <h1 style="color: #4f46e5; letter-spacing: 5px;">${otp}</h1>
                <p>This code will expire in 10 minutes.</p>
            </div>
        `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
