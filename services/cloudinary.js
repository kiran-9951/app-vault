const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "douxxtt1q",
  api_key: "191686574389165",
  api_secret: "Y7TD2YLjXF-fLnIqmoduPQHROhU",
});

const allowedFormats = [
  "jpg", "jpeg", "png",
  "mp4", "mov", "avi", "mkv",
  "mp3", "wav", "ogg",
  "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx"
];

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const format = file.originalname.split('.').pop().toLowerCase();

    if (!allowedFormats.includes(format)) {
      throw new Error(`File format .${format} is not supported`);
    }
    return {
      folder: "assets",
      resource_type: "auto",
      public_id: `${Date.now()}-${file.originalname}`,
      format: format,
    };
  },
});

const upload = multer({ storage,limits: {
    fileSize: 50 * 1024 * 1024,
  }, });

const deleteAssetFromCloud = async (fileUrl) => {
  try {
    const urlParts = fileUrl.split("/");
    const filenameWithExtension = urlParts[urlParts.length - 1];
    const filenameWithoutExtension = filenameWithExtension.split(".")[0];
    const publicId = `assets/${filenameWithoutExtension}`;
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary deletion failed:", error.message);
  }
};


module.exports = { upload, deleteAssetFromCloud };
