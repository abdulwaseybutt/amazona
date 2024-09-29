import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { isAdmin, isAuth } from "../utils.js";
import User from "../models/userModel.js";
import expressAsyncHandler from "express-async-handler";
import { promises as fs } from 'fs';

const upload = multer();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadRouter = express.Router();

uploadRouter.post(
  "/",
  isAuth,
  isAdmin,
  upload.single("file"),
  async (req, res) => {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    try {
      const result = await streamUpload(req);
      res.send(result);
    } catch (err) {
      res.send(err.message);
    }
  }
);

const uploadVideo = multer({
  dest: "uploads/",
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(mp4|mkv|avi|mov)$/)) {
      return cb(new Error("Please upload a video file"));
    }
    cb(null, true);
  },
});

uploadRouter.post(
  "/uservideo",
  isAuth,
  uploadVideo.single("video"),
  expressAsyncHandler(async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send({ message: "No video file provided" });
      }

      const videoPath = req.file.path;

      let result;
      try {
        result = await cloudinary.uploader.upload(videoPath, {
          resource_type: "video",
          public_id: `user_videos/${req.user._id}`,
        });
      } catch (cloudinaryError) {
        console.error("Cloudinary Error:", cloudinaryError);
        console.error("Cloudinary Error:", cloudinaryError);
        return res.status(500).send({
          message: "Error uploading video to Cloudinary",
          error: cloudinaryError.message,
        });
      }

      const videoUrl = result.secure_url;

      try {
        await User.findByIdAndUpdate(req.user._id, { videoUrl }, { new: true });
      } catch (dbError) {
        console.error("Database Error:", dbError);
        return res.status(500).send({
          message: "Error updating the user with the new video URL",
          error: dbError.message,
        });
      }
      try {
        await fs.unlink(req.file.path); // Delete the file asynchronously
      } catch (fsError) {
        console.error("File Deletion Error:", fsError);
      }
      res.send({ url: videoUrl });
    } catch (error) {
      console.error("Unknown Error:", error);
      res.status(500).send({
        message: "An unexpected error occurred",
        error: error.message,
      });
    }
  })
);


export default uploadRouter;
