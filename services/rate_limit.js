const rateLimit = require("express-rate-limit")
const resendOtpRateLimit = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 1,
    message: "Too many OTP resend attempts,please try again after 1 minutes."
})

module.exports = {resendOtpRateLimit}