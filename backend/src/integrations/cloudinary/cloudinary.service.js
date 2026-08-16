import cloudinary from "./cloudinary.js";

const uploadBuffer = (buffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      },
    );
    stream.end(buffer);
  });
};

const deleteAsset = (publicId, resourceType) => {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    type: "upload",
  });
};

export { uploadBuffer, deleteAsset };
