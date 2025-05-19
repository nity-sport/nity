// pages/api/test.ts
export default function handler(req, res) {
    res.status(200).json({
      bucket: process.env.AWS_S3_BUCKET_NAME,
    });
  }
  