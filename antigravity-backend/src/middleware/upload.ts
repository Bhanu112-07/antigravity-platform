import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
// @ts-ignore
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: express.Request, file: Express.Multer.File) => {
    // Determine resource type based on mime type
    // Because Typescript with multer-storage-cloudinary is strict, we cast it to any
    const isVideo = file.mimetype.startsWith('video/');
    return {
      folder: 'antigravity',
      resource_type: isVideo ? 'video' : 'image',
      public_id: Date.now() + '-' + path.parse(file.originalname).name,
    } as any;
  },
});

export const upload = multer({ storage });
export const productUpload = upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'video', maxCount: 1 }
]);
