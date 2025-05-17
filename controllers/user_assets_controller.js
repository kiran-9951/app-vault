const userAssetModel = require("../models/user_assets");
const UserModel = require("../models/user_schema");
const { encrypt, decrypt } = require("../services/encryption");
const { deleteAssetFromCloud } = require("../services/cloudinary");
const mongoose = require("mongoose");

const MAX_FREE_STORAGE = 250 * 1024 * 1024;

const uploadAssetToVault = async (req, res) => {
    try {
        const email = req.email;
        const file = req.file;
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (file) {
            const { path: file_url, size: file_size, originalname: file_name, mimetype: file_type } = file;

            if (user.storage + file_size > MAX_FREE_STORAGE) {
                return res.status(403).json({
                    message: "Upload failed. Free storage limit of 250MB exceeded.",
                    currentStorage: user.storage,
                    fileSize: file_size,
                    maxAllowed: MAX_FREE_STORAGE
                });
            }

            const userAsset = new userAssetModel({
                email,
                file_url,
                file_size,
                file_name,
                file_type,
                isEncrypted: true,
            });

            await userAsset.save();
            await UserModel.findOneAndUpdate({ email }, { $inc: { storage: file_size } });
            return res.status(201).json({ message: "Asset uploaded successfully", data: userAsset });
        }

        if (req.body.keys) {
            const encryptedKeys = encrypt(req.body.keys);
            const userAsset = new userAssetModel({
                email,
                file_name: "EncryptedText",
                file_type: "text/plain",
                file_url: encryptedKeys,
                isEncrypted: true,
            });

            await userAsset.save();
            return res.status(201).json({ message: "Asset uploaded successfully", data: userAsset });
        }

        return res.status(400).json({ message: "Please upload your files or enter your keys" });

    } catch (error) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({ message: "File too large. Maximum allowed size is 50MB" });
        }
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

const fetchUserAssetFromVault = async (req, res) => {
    try {
        const email = req.email;
        const userAssets = await userAssetModel.find({ email }).sort({ uploaded_at: -1 });

        const textAssets = [];
        const fileAssets = [];

        for (const asset of userAssets) {
            if (asset.file_type === "text/plain") {
                const decryptedText = decrypt(asset.file_url);
                textAssets.push({
                    _id: asset._id,
                    file_type: asset.file_type,
                    decryptedText,
                    uploaded_at: asset.uploaded_at,
                });
            } else {
                fileAssets.push(asset);
            }
        }

        return res.status(200).json({ message: "User Assets Fetched Successfully", textAssets, fileAssets });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

const deleteUserAssetFromVault = async (req, res) => {
    try {
        const email = req.email;
        const { asset_id } = req.body;

        if (!mongoose.Types.ObjectId.isValid(asset_id)) {
            return res.status(400).json({ message: "Invalid asset ID" });
        }

        const asset = await userAssetModel.findOne({ _id: asset_id, email });
        if (!asset) {
            return res.status(404).json({ message: "Asset not found" });
        }

        if (asset.file_type !== "text/plain") {
            try {
                await deleteAssetFromCloud(asset.file_url);
                await UserModel.findOneAndUpdate({ email }, { $inc: { storage: -asset.file_size } });
            } catch(error) {
                console.log(error.message)
            }
        }

        await userAssetModel.deleteOne({ _id: asset_id });
        return res.status(200).json({ message: "Asset deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getSingleAssetFromVault = async (req, res) => {
    try {
        const email = req.email;
        const { asset_id } = req.body;

        if (!asset_id || !mongoose.Types.ObjectId.isValid(asset_id)) {
            return res.status(400).json({ message: " assetid missing or Invalid asset ID" });
        }

        const asset = await userAssetModel.findOne({ _id: asset_id, email });
        if (!asset) {
            return res.status(404).json({ message: "Asset not found" });
        }

        if (asset.file_type === "text/plain") {
            const decryptedText = decrypt(asset.file_url);
            return res.status(200).json({
                message: "Text asset fetched successfully",
                asset: {
                    _id: asset._id,
                    file_name: asset.file_name,
                    file_type: asset.file_type,
                    decryptedText,
                    uploaded_at: asset.uploaded_at,
                },
            });
        }

        return res.status(200).json({ message: "Asset fetched successfully", asset });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    uploadAssetToVault,
    fetchUserAssetFromVault,
    deleteUserAssetFromVault,
    getSingleAssetFromVault,
};
