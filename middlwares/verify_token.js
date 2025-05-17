const jsonwebtoken = require("jsonwebtoken")
const UserModel = require("../models/user_schema")


const verifyOtpToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(403).json({ message: "Forbidden: No token provided " });
        }
        const token = authHeader.split(" ")[1];
        const decode = jsonwebtoken.verify(token, process.env.VERIFY_OTP_SECRET_KEY); 
        req.email = decode.email
        next()
    } catch (error) {
        res.status(401).json({
            message: "Invalid or expired OTP token",
            error: error.message,
        });
    }
}
const verifyUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(403).json({ message: "Forbidden: No token provided " });
        }
        const token = authHeader.split(" ")[1];
        const decode = jsonwebtoken.verify(token, process.env.VERIFY_USER_SECRETKEY);
        const email = decode.email;
        const role = decode.role
        req.email = email;
        req.role = role
        const existingUser = await UserModel.findOne({ email: email });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }
        next()
    }
    catch (error) {
        res.status(401).json({ message: "Invalid or expired token", error: error.message })
    }
}


const verifyAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(403).json({ message: "Forbidden: No token provided " });
        }
        const token = authHeader.split(" ")[1];
        const decode = jsonwebtoken.verify(token, process.env.VERIFY_USER_SECRETKEY);
       const email = decode.email;
        const role = decode.role
        req.email = email;
        req.role = role
        const existingAdmin = await UserModel.findOne({ email: email, role: "admin" });
        if (!existingAdmin) {
            return res.status(404).json({ message: "User not found" });
        }
        next()
    }
    catch (error) {
        res.status(401).json({ message: "Invalid or expired token", error: error.message })
    }
}


module.exports = { verifyUser, verifyAdmin, verifyOtpToken };