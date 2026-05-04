import cloudinary from "../config/cloudinary.js";

export async function uploadBase64ToCloudinary(fileData, folder = "customer-support-flow") {
  if (!fileData) return null;

  const result = await cloudinary.uploader.upload(fileData, {
    folder,
    resource_type: "auto",
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}