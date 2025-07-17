import type { NextApiRequest, NextApiResponse } from "next";
import { formidable } from "formidable";
import fs from "fs";
import { uploadToS3 } from "../../src/lib/uploadToS3";


export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (req: NextApiRequest): Promise<{ fields: any; files: any }> => {
  const form = formidable({
    keepExtensions: true,
    multiples: false, // <- aqui está a mágica
    maxFileSize: 5 * 1024 * 1024, // 5MB limit (compressed images)
    maxTotalFileSize: 5 * 1024 * 1024, // 5MB total limit
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error("Formidable parse error:", err);
        if (err.code === 'LIMIT_FILE_SIZE' || err.message.includes('maxFileSize')) {
          return reject(new Error('Arquivo muito grande. Limite: 10MB'));
        }
        return reject(err);
      }
      resolve({ fields, files });
    });
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  try {
    const { files } = await parseForm(req);

    console.log("UPLOAD DEBUG — files:", files);

    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({
        error: "Erro no upload: nenhum arquivo encontrado",
        detail: files,
      });
    }

    // Additional file size check
    if (file.size > 5 * 1024 * 1024) {
      return res.status(413).json({
        error: `Arquivo muito grande: ${file.originalFilename} (${(file.size / 1024 / 1024).toFixed(2)}MB). Limite: 5MB`
      });
    }

    const buffer = fs.readFileSync(file.filepath);

    const url = await uploadToS3({
      buffer,
      originalName: file.originalFilename || "upload.jpg",
      mimeType: file.mimetype || "image/jpeg",
    });

    return res.status(200).json({ url });
  } catch (err: any) {
    console.error("Erro no upload:", err);
    
    // Handle specific error types
    if (err.message && err.message.includes('muito grande')) {
      return res.status(413).json({ error: err.message });
    }
    
    return res.status(500).json({ error: "Erro no upload", detail: err.message || err });
  }
}
