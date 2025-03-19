import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";
import {
  AWS_ACCESS_KEY,
  AWS_BUCKET_NAME,
  AWS_REGION,
  AWS_SECRET_KEY,
} from "../config/config";
import { Request } from "express";

aws.config.update({
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY,
  region: AWS_REGION,
});

const s3 = new aws.S3();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type , only JPEG, JPG and PNG is allowed!`));
  }
};

// export const upload = multer({
//   fileFilter,
//   storage: multerS3({
//     s3: s3,
//     bucket: AWS_BUCKET_NAME || "your-bucket-name",
//     acl: "public-read",
//     metadata: function (req, file, cb) {
//       cb(null, { fieldName: file.fieldname });
//     },
//     key: function (req, file, cb) {
//       const fileName = `${Date.now().toString()}-${file.originalname}`;
//       cb(null, fileName);
//     },
//   }),
//   limits: { fileSize: 5 * 1024 * 1024 },
// });
