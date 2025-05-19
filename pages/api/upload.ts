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
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
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

    const buffer = fs.readFileSync(file.filepath);

    const url = await uploadToS3({
      buffer,
      originalName: file.originalFilename || "upload.jpg",
      mimeType: file.mimetype || "image/jpeg",
    });

    return res.status(200).json({ url });
  } catch (err) {
    console.error("Erro no upload:", err);
    return res.status(500).json({ error: "Erro no upload", detail: err });
  }
}
