const mongoose = require("mongoose")
const userAssetSchema = new mongoose.Schema({
    email: {type:String },
    file_size: {type:Number },
    file_name: {type:String },
    file_type: {type:String },
    file_url: {type:String }, 
    uploaded_at:{ type:Date , default: Date.now() }    
}, {strict:false})

const userAssetModel = mongoose.model("userAsset", userAssetSchema);
userAssetModel.createIndexes({ email: 1, uploaded_at: -1 });
module.exports = userAssetModel;