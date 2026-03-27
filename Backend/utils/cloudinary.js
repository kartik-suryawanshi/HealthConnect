import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

let isConfigured = false;

const ensureConfigured = () => {
  if (isConfigured) return;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    const missing = [
      !cloudName ? 'CLOUDINARY_CLOUD_NAME' : null,
      !apiKey ? 'CLOUDINARY_API_KEY' : null,
      !apiSecret ? 'CLOUDINARY_API_SECRET' : null,
    ].filter(Boolean);
    throw new Error(`Cloudinary env vars missing: ${missing.join(', ')}`);
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  isConfigured = true;
};

const safeUnlink = (filePath) => {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    // best-effort cleanup
  }
};

export const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
          throw new Error('No local file path provided for upload');
        }
        ensureConfigured();
        // Upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        // file has been uploaded successfully
        safeUnlink(localFilePath); // remove locally saved temp file
        return response;
    } catch (error) {
        safeUnlink(localFilePath); // cleanup temp file
        const details =
          error && typeof error === 'object' && 'message' in error
            ? error.message
            : String(error);
        throw new Error(`Cloudinary upload failed: ${details}`);
    }
}
