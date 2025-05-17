const mongoose = require("mongoose");
const otpSchema = new mongoose.Schema({
  email: { type: String},
  otp: { type: Number},
  expires_at: {
    type: Date,
    index: { expires: 300 } 
  }
})
const OtpModel = mongoose.model("Otp", otpSchema);
module.exports =  OtpModel;
