require('dotenv').config(); // Load environment variables
const sendMail = require('./mailer'); // Adjust the path as per your file structure

(async () => {
  try {
    await sendMail(
      'amandev307@gmail.com', // Replace with the recipient's email address
      'Test Subject', // Email subject
      null, // Plain text body (optional)
      '<h1>Hello!</h1><p>This is a test email from your application.</p>' // HTML body
    );
    console.log('Email sent successfully');
  } catch (err) {
    console.error('Email sending failed:', err.message);
  }
})();
