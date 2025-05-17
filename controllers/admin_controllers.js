const userAssetModel = require("../models/user_assets");
const UserModel = require("../models/user_schema");

const getUserAssets = async (req, res) => {
  try {
    const assets = await userAssetModel.find({}).sort({ uploaded_at: -1 })
    const totalCount = await userAssetModel.countDocuments();
    res.status(200).json({ message: "Assets fetched successfully", assets, totalCount });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch assets", error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await UserModel.find({}).sort({ signed_at: -1 })
    const totalCount = await UserModel.countDocuments();
    res.status(200).json({ message: "Users fetched successfully", users, totalCount });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ message: "User ID is required" });

    const deletedUser = await UserModel.findByIdAndDelete(user_id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
};

const deleteAsset = async (req, res) => {
  try {
    const { asset_id } = req.body;
    if (!asset_id) return res.status(400).json({ message: "Asset ID is required" });

    const deletedAsset = await userAssetModel.findByIdAndDelete(asset_id);
    if (!deletedAsset) return res.status(404).json({ message: "Asset not found" });

    res.status(200).json({ message: "Asset deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete asset", error: error.message });
  }
};

module.exports = { getUserAssets, getUsers, deleteUser, deleteAsset };
