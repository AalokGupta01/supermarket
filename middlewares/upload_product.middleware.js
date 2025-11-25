import multer from "multer";
import fs from "fs";
import path from "path";

// Ensure the directory exists
const uploadDir = "./assets/uploaded_image";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const isImageMime = file.mimetype.startsWith("image/");
    // Fallback: Check extension if mimetype is generic octet-stream
    const isImageExt = file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i);

    if (isImageMime || (file.mimetype === 'application/octet-stream' && isImageExt)) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed! Received: " + file.mimetype), false);
    }
};

export const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});