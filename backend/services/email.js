import nodemailer from "nodemailer";
import "dotenv/config.js";


const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
});


export const sendEmail=async({from,to,subject,text,html})=>{
try{
    transporter.sendMail({from,to,subject,html,text});
}
catch(err){
    console.log("Error in sending the email");
    throw new Error(err);
}
}



