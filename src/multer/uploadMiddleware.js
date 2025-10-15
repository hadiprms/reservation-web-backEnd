const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Map keywords to folders
const folderMap = {
  tour: 'uploads/tours',
  hotel: 'uploads/hotels',
  edit: 'uploads/users'
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadFolder = 'uploads/others'; // default fallback

    // find first keyword that matches URL
    for (const key in folderMap) {
      if (req.originalUrl.includes(`/${key}`)) {
        uploadFolder = folderMap[key];
        break;
      }
    }

    fs.mkdirSync(uploadFolder, { recursive: true });
    cb(null, uploadFolder);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) cb(null, true);
    else cb(new Error('Only JPEG, JPG, or PNG images are allowed.'));
  },
});

module.exports = upload;