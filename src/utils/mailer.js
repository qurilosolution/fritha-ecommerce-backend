
const nodemailer = require("nodemailer");
require("dotenv").config();

// Log the email and password (be cautious with logging sensitive data in production)
console.log("GMAIL_USER:", process.env.GMAIL_USER);
console.log("GMAIL_PASSWORD:", process.env.GMAIL_PASSWORD);

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use true for port 465
  auth: {
    user: process.env.GMAIL_USER, // Sender email
    pass: process.env.GMAIL_PASSWORD, // App Password
  },
});

async function sendMail(to, subject, text, html) {
  try {
    // Log the email sending details
    console.log(`Sending email to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML Content: ${html}`);

    const info = await transporter.sendMail({
      from: `"Fritha" <${process.env.GMAIL_USER}>`, // Sender name and email
      to, // Recipient email
      subject, // Email subject
      text, // Plain text (optional)
      html, // HTML body
    });

    // Log the message ID returned by the sendMail method
    console.log("Message sent: %s", info.messageId);
    return info.messageId; // Optional, to return the ID
  } catch (error) {
    // Log the error details
    console.error("Error sending mail:", error.message);
    throw new Error("Email sending failed");
  }
}

module.exports = sendMail;
