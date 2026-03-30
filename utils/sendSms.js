const twilio = require("twilio");

const sendSms = async (to, otp) => {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
  );

  await client.messages.create({
    body: `Your RentMate verification code is: ${otp}. Valid for 10 minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: to, // Must include country code, e.g., +919876543210
  });
};

module.exports = sendSms;
