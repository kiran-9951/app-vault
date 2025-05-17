const nodeEmailer = require("nodemailer");

const Transporter = nodeEmailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASSWORD,
        logger: true,
        debug: true,
    }
});

const sendOtpEmail = async (to, otp) => {
    try {
        const mailOptions = {
            from: `"SecureVault" <${process.env.USER_EMAIL}>`,
            to,
            subject: 'SecureVault - OTP Verification Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #4a90e2;">SecureVault Verification</h2>
                    <p>Hi there,</p>
                    <p>We received a request to register or verify your email on <strong>SecureVault</strong>.</p>
                    <p>Please use the OTP below to complete your verification. This OTP is valid for the next <strong>5 minutes</strong>.</p>
                    <div style="font-size: 24px; font-weight: bold; color: #333; margin: 20px 0; padding: 10px; background-color: #f3f3f3; text-align: center; border-radius: 5px;">
                        ${otp}
                    </div>
                    <p>If you didn’t request this, you can safely ignore this email.</p>
                    <br />
                    <p>Thanks,</p>
                    <p>The SecureVault Team</p>
                </div>
            `
        };
        await Transporter.sendMail(mailOptions);
    
        return true;
    } catch (error) {
        console.log(error.message);
    }
};

const sendSuccessLogin = async (to) => {
    try {
        const mailOptions = {
            from: `"SecureVault" <${process.env.USER_EMAIL}>`,
            to,
            subject: 'SecureVault - Login Notification',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #4caf50;">Login Successful</h2>
                    <p>Hi there,</p>
                    <p>This is to inform you that a login to your <strong>SecureVault</strong> account was just made successfully.</p>
                    <p>If this was you, no action is needed.</p>
                    <p><strong>If this wasn't you</strong>, please reset your password immediately and contact our support team.</p>
                    <br />
                    <p>Time: ${new Date().toLocaleString()}</p>
                    <br />
                    <p>Stay secure,</p>
                    <p>The SecureVault Team</p>
                </div>
            `
        };
        await Transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.log(error.message);
    }
};

const sendForgotPasswordEmail = async (to, otp) => {
    try {
        const mailOptions = {
            from: `"SecureVault" <${process.env.USER_EMAIL}>`,
            to,
            subject: 'SecureVault - Password Reset Request',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #f44336;">Password Reset Requested</h2>
                    <p>Hi there,</p>
                    <p>We received a request to reset the password for your <strong>SecureVault</strong> account.</p>
                    <p>Your password reset OTP is:</p>
                    <div style="font-size: 24px; font-weight: bold; color: #f44336; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p>This OTP is valid for <strong>5 minutes</strong>.</p>
                    <p>If you didn’t request this, you can safely ignore this email.</p>
                    <br />
                    <p>Thanks,</p>
                    <p>The SecureVault Team</p>
                </div>
            `
        };

        await Transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.log(error.message);
    }
};



module.exports = { sendOtpEmail, sendSuccessLogin,sendForgotPasswordEmail };
