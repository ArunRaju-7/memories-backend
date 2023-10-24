import nodemailer from 'nodemailer';

const sendEmail = async (email, subject, text) =>{
    try{
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            service: process.env.EMAIL_SERVICE,
            post: Number(process.env.EMAIL_PORT),
            secure:Boolean(process.env.EMAIL_SECURE),
            secureConnection: false,
            tls:{
                rejectUnauthorized: true
            },
            auth:{
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject:subject,
            text:text
        });
    }catch(error){

    }
}

export default sendEmail;

// console.log("EMAILHOST",process.env.EMAIL_HOST);
// const response =await sendEmail("arunachalamraj06@gmail.com", "checking", "checking");