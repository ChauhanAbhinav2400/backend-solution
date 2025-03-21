import nodemailer from 'nodemailer'


export const transporter = () => {
    return nodemailer.createTransport({
        service: process.env.MAIL_HOST,
        auth: {
            user: process.env.GMAIL,
            pass: process.env.GPASSWORD,
        }
    });
}