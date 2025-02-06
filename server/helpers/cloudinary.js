const cloudinary = require("cloudinary").v2;
const multer = require("multer");


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const storage = new multer.memoryStorage();

async function imageUploadUtil(file) {
  const result = await cloudinary.uploader.upload(file, {
    resource_type: "auto", 
    });

  return result;
}


async function deleteImage(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image", 
    });
    return result;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw new Error("Error deleting image");
  }
}


const upload = multer({ storage });

module.exports = { upload, imageUploadUtil, deleteImage };
