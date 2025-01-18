const sendMail = require("../utils/mailer");

const forgotPasswordEmail =async (email, otp) => {
    try{
    const subject='Forgot Password';
    const text = `Use this OTP to reset your password: ${otp}`;
    const html = `<p>Use this OTP to reset your password: ${otp}</p>`; // HTML body
    await sendMail(email, subject, text, html);
    }
    catch(err){
        console.log(err);
        throw err;
    }
}

module.exports=forgotPasswordEmail;