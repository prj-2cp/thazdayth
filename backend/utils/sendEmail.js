const { response } = require("express");
const {Resend} = require("resend") ;
require("dotenv").config() ;

//i used resend 
const resend = new Resend(process.env.RESEND_API_KEY);
console.log("before sending email") ;
async function sendVerification(email, code) {
  const response = await resend.emails.send({
    from: "Thazdayth@resend.dev",
    to: email,
    subject: "Your Verification Code",
    html: `<p>Your code is: <strong>${code}</strong></p>`
  });
  console.log("after sending email") ;
  console.log(response) ;
}
exports.sendVerification  = sendVerification ;