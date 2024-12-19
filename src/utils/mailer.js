// const nodemailer = require('nodemailer');
// require('dotenv').config();

// const transporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com',
//   port: 465,
//   secure: true,
//   auth: {
//     user: process.env.GMAIL_USER,
//     pass: process.env.GMAIL_PASSWORD,
//   },
// });

// transporter.verify((error) => {
//   if (error) {
//     console.error('Mailer verification failed:', error);
//   } else {
//     console.log('Mailer is ready to send messages.');
//   }
// });

// module.exports = transporter;


// const nodemailer = require('nodemailer');
// require('dotenv').config();

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.GMAIL_USER, // Your Gmail address
//     pass: process.env.GMAIL_PASSWORD, // Your App Password or Gmail password
//   },
// });

// transporter.verify((error, success) => {
//   if (error) {
//     console.error('Mailer verification failed:', error);
//   } else {
//     console.log('Mailer is ready to send messages.');
//   }
// });

// module.exports = transporter;
// // .........................................................................................// //

// const nodemailer = require('nodemailer');
// require('dotenv').config();

// // Create a transporter using environment variables for Gmail credentials
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     host: 'smtp.gmail.com',
//     port: 587, // Use 587 for TLS
//     secure: false, // Use `true` for port 465, `false` for all other ports
//     auth: {
//         user: process.env.GMAIL_USER, // Your Gmail address from .env file
//         pass: process.env.GMAIL_PASSWORD, // Your App Password or Gmail password from .env file
//     },
// });

// // Verify the transporter configuration
// transporter.verify((error, success) => {
//     if (error) {
//         console.error('Mailer verification failed:', error);
//     } else {
//         console.log('Mailer is ready to send messages.');
//     }
// });

// // Function to send mail with the transporter
// async function sendMail(to, subject, text, html) {
//     try {
//         // Send mail with defined transport object
//         const info = await transporter.sendMail({
//             from: process.env.GMAIL_USER, // Sender address
//             to: to, // List of receivers
//             subject: subject, // Subject line
//             text: text, // Plain text body (optional)
//             html: html, // HTML body
//         });

//         console.log('Message sent: %s', info.messageId);
//     } catch (error) {
//         console.error('Error sending email:', error);
//     }
// }

// module.exports = sendMail;


// const nodemailer = require("nodemailer");
// require('dotenv').config();

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false, // Use true for port 465
//   auth: {
//     user: process.env.GMAIL_USER, // Sender email from environment variables
//     pass: process.env.GMAIL_PASSWORD, // App Password
//   },
// });

// async function sendMail(to, subject, text, html) {
//   try {
//     const info = await transporter.sendMail({
//       from: process.env.GMAIL_USER, // Sender address
//       to: to, // Receiver address
//       subject: subject, // Subject
//       text: text, // Plain text body
//       html: html, // HTML body
//     });
//     console.log("Message sent: %s", info.messageId);
//   } catch (error) {
//     console.error("Error sending mail:", error.message);
//     throw new Error("Email sending failed");
//   }
// }

// module.exports = sendMail;



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
