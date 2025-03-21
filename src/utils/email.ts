
import { transporter } from "./transport";


export const sendOtpEmail = async (email: string, otp: string) => {
    try {
        const tPorter = transporter()

        const mailOptions = {
            from: "caaryan877@gmail.com",
            to: email,
            subject: "Account Verification OTP",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>Account Verification</h2>
                <p>Your OTP for account verification is:</p>
                <h1 style="font-size: 32px; letter-spacing: 5px; font-weight: bold; color: #4A90E2; text-align: center; padding: 10px; background-color: #F8F9FA; border-radius: 5px;">${otp}</h1>
                <p>This OTP is valid for 10 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
              </div>
            `,
        };

        const response = await tPorter.sendMail(mailOptions)
        return response
    } catch (error) {
        console.log(error)
        return
    }

}