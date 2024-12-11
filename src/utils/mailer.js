// utils/mailer.js
const nodemailer = require('nodemailer');
require('dotenv').config();

// SMTP transporter setup for Gmail
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Gmail SMTP server
  port: 465, // Use 465 for SSL or 587 for TLS
  secure: true, // Use true for 465, false for other ports
  auth: {
    user: process.env.GMAIL_USER, // Load from environment variable
    pass: process.env.GMAIL_PASSWORD, // Load from environment variable
  },
});

// Function to send a message (OTP or any custom message)
const sendMessage = async (recipient, subject, message) => {
  const mailOptions = {
    from: process.env.GMAIL_USER, // Sender's email address
    to: recipient, // Recipient's email address
    subject: subject, // Subject of the email
    text: message, // Body of the email
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Error sending email: ' + error.message);
  }
};

module.exports = { sendMessage };
