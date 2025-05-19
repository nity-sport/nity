import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./s3Client";
import { v4 as uuid } from "uuid";

interface UploadParams {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

export async function uploadToS3({
  buffer,
  originalName,
  mimeType,
}: UploadParams): Promise<string> {
  const bucket = process.env.AWS_S3_BUCKET_NAME;
  const region = process.env.AWS_S3_REGION;

  if (!bucket || !region) {
    throw new Error("S3 config missing: Bucket or Region not set in .env");
  }

  const fileKey = `${uuid()}-${originalName}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: fileKey,
    Body: buffer,
    ContentType: mimeType,
  
  });

  try {
    const response = await s3.send(command);
    console.log("✅ S3 Upload success:", response);

    const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${fileKey}`;
    return publicUrl;
  } catch (err) {
    console.error("❌ Erro ao enviar para S3:", err);
    throw new Error("Erro no upload para o S3");
  }
}
