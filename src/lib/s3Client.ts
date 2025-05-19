import { S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY!,
  },
  endpoint: `https://s3.${process.env.AWS_S3_REGION}.amazonaws.com`, // obrigatório pra buckets fora do us-east-1
});
