import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export function sendResetLink (email, resetLink) {
    transporter.sendMail({
        from: '"Wins Per Minute" <jalenemmanuelevans@gmail.com>', // TODO: create an email for the app
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
