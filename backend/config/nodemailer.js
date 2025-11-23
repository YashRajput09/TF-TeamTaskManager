import nodemail from "nodemailer";
import win from "win-ca"


export const sendEmail =async (data)=>{
    //crate a transporter
    const transporter=nodemail.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth:{
            user:process.env.USER_MAIL,
            pass:process.env.USER_PASS,
        },  
        tls: {
            rejectUnauthorized: false, // Skip certificate validation
          },
        logger: true,
        debug: true,
    })
    
    const sendMail=await transporter.sendMail({
        from:`"Task Flow" <${process.env.USER_MAIL}>`,
        to:data.to,
        subject:data.subject,
        html:data.html
    })
}