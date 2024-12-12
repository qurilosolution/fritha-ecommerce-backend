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

//  this is the code of my new code  code 



const nodemiler = require("nodemailer")
const transporter = nodemiler.createTransport(
    {
        service: 'gmail',
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // Use `true` for port 465, `false` for all other ports
        auth: {
          user: "virusonearth7@gmail.com",
          pass: "zvso ixzc onoy efpv",
        },
    }
)


async function sendMail(to,subject,text,html) {
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: "virusonearth7@gmail.com", // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      //text: text, // plain text body
      html: html, // html body
    });
  
    console.log("Message sent: %s", info.messageId);
    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
  }

  module.exports = sendMail
 