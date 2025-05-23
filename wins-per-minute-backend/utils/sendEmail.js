import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL,
        clientId: '73439477218-86j4t4bn9qnfn595f3q6npedmcpfsbs7.apps.googleusercontent.com',
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: process.env.ACCESS_TOKEN,
    },
});

export function sendResetLink (email, resetLink) {
    transporter.sendMail({
        from: `"Wins Per Minute" <${process.env.EMAIL}>`,
        to: email,
        subject: 'Password Reset Link',
        html: `<p>Click here to reset your password: <a href="${resetLink}">${resetLink}</a></p>`,
    }, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}
