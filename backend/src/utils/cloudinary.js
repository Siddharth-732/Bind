import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // Node's built-in file system module

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("file upload to cloudinary successfully!!");
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteFromCloudinary = async (cloudinaryUrl) => {
  try {
    if (!cloudinaryUrl) return null;

    const urlArray = cloudinaryUrl.split("/");
    const imageString = urlArray[urlArray.length - 1]; // "my_image_id.jpg"
    const publicId = imageString.split(".")[0]; // "my_image_id"

    const response = await cloudinary.uploader.destroy(publicId);
    return response;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
