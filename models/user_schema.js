const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    is_verified: { type: Boolean, default: false },
    is_locked: { type: Boolean, default: false },
    storage: { type: Number, default: 0 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    refreshToken: { type: String, default: null },
    signed_at: { type: Date, default: Date.now }
}, { strict: false })

const UserModel = mongoose.model("Users", userSchema)
UserModel.createIndexes({email : 1 , storage:1 })
module.exports = UserModel;