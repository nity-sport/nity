// src/pages/api/coach/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../src/lib/dbConnect";
import Coach from "../../../src/models/Coach";



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  switch (req.method) {
    case "GET":
      const coaches = await Coach.find({});
      return res.status(200).json(coaches);

    case "POST":
      try {
        console.log("📥 Recebido para criar Coach:", req.body);
        const coach = await Coach.create(req.body);
        return res.status(201).json(coach);
      } catch (err) {
        console.error("❌ Erro ao criar coach:", err);
        return res.status(400).json({ error: "Erro ao criar coach", detail: err });
      }


    default:
      return res.status(405).json({ message: "Método não permitido" });
  }
}
