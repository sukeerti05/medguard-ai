import multer from "multer";
import path from "path";
import fs from "fs";

// create uploads folder if not exists
const uploadsDir = "uploads";

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);

    const hospital = (req.body.hospital_name || "hospital")
      .replace(/\s+/g, "_")
      .toLowerCase();

    const doctor = (req.body.doctor_name || "doctor")
      .replace(/\s+/g, "_")
      .toLowerCase();

    const date = req.body.visit_date
      ? new Date(req.body.visit_date).toISOString().split("T")[0]
      : "date";

    const timestamp = Date.now();

    const newFileName = `${hospital}_${doctor}_${date}_${timestamp}${ext}`;

    cb(null, newFileName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and image files allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export default upload;