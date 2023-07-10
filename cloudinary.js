const cloudinary = require('cloudinary').v2;
const path = require('path');

// const __dirname = path.resolve();
const destFolder = "gamepad/photos";

// Configuration 
cloudinary.config({
    cloud_name: "dxsbqj6z1",
    api_key: "126648962619959",
    api_secret: "xQreV9uE75MKIEG3HGz7ve0sP1Q",
    secure: true
});

const options = {
    use_filename: true,
    overwrite: false,
    folder: destFolder
};

// Upload

const uploadImage = async (imagePath) => {
    try {
        const result = await cloudinary.uploader.upload(imagePath, options);
        return result.secure_url;
    } catch (error) {
        console.error(error);
    }
};

const deleteImage = async (imagePath) => {
    try {
        const result = await cloudinary.uploader.destroy(imagePath, { resource_type: "image" });
        return result;
    } catch (error) {
        console.error(error);
    }
};


module.exports = {
    uploadImage,
    deleteImage,
    destFolder
};