import nodemailer from "nodemailer";


export const sendEmail =async (data)=>{
    //crate a transporter
    console.log(process.env.USER_MAIL,process.env.USER_PASS)
    const transporter=nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth:{
            user:process.env.USER_MAIL,
            pass:process.env.USER_PASS,
        },  
        tls: {
            rejectUnauthorized: true, // Skip certificate validation
          },
        logger: true,
        debug: true,
    })
    
    console.log(transporter);
    const sendMail=await transporter.sendMail({
        from:`"Task Flow" <${process.env.USER_MAIL}>`,
        to:data.to,
        subject:data.subject,
        html:data.html
    })
}