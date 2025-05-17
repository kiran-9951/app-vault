const express = require("express")
const router = express.Router()
const { register, verifyOtp, resendOtp, Login, forgotPassword, updateNewPassword, Logout, refreshToken }
    = require("../controllers/user_controller")
const { uploadAssetToVault, fetchUserAssetFromVault, getSingleAssetFromVault, deleteUserAssetFromVault }
    = require("../controllers/user_assets_controller")
const { getUserAssets, getUsers, deleteAsset, deleteUser } = require("../controllers/admin_controllers")
const { verifyOtpToken, verifyUser, verifyAdmin } = require("../middlwares/verify_token")
const { upload } = require("../services/cloudinary")
const { resendOtpRateLimit } = require("../services/rate_limit")

router.post("/register", upload.single("image"), register)
router.post("/login", verifyOtpToken, Login)
router.post("/logout", verifyUser,Logout)
router.post("/refreshToken", refreshToken)
router.post("/verifyotp", verifyOtp)
router.post("/resendotp", resendOtpRateLimit, resendOtp)
router.post("/forgotpassword", verifyUser, forgotPassword)
router.post("/updatepassword", verifyOtpToken, updateNewPassword)

router.post("/uploadasset", verifyUser, upload.single("image"), uploadAssetToVault)
router.post("/getassets", verifyUser, fetchUserAssetFromVault)
router.post("/getsingleasset", verifyUser, getSingleAssetFromVault)
router.delete("/deleteasset", verifyUser, deleteUserAssetFromVault)

router.post("/getallusers", verifyAdmin, getUsers)
router.post("/getallassets", verifyAdmin, getUserAssets)
router.delete("/deleteuser", verifyAdmin, deleteUser)
router.delete("/admindeleteasset", verifyAdmin, deleteAsset)


module.exports = router
