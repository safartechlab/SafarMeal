const nodemailer = require("nodemailer");
const { EMAIL, PASSWORD } = require("./config");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: EMAIL,
    pass: PASSWORD,
  },
});

const Sendmail = async (to, subject, html) => {
  const mailOptions = {
    from: `"Safar Team" <${EMAIL}> `,
    to,
    subject,
    html,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully!");
  } catch (error) {
    console.error("❌ Email sending failed:", error);
  }
};

module.exports = { Sendmail };
