// src/pages/api/coach/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../src/lib/dbConnect";
import Coach from "../../../src/models/Coach";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const { id } = req.query;

  switch (req.method) {
    case "GET":
      try {
        const coach = await Coach.findById(id);
        if (!coach) return res.status(404).json({ message: "Coach não encontrado" });
        return res.status(200).json(coach);
      } catch {
        return res.status(400).json({ error: "ID inválido" });
      }

    case "PUT":
      try {
        const updated = await Coach.findByIdAndUpdate(id, req.body, { new: true });
        return res.status(200).json(updated);
      } catch (err) {
        return res.status(400).json({ error: "Erro ao atualizar coach" });
      }

    case "DELETE":
      try {
        await Coach.findByIdAndDelete(id);
        return res.status(204).end();
      } catch {
        return res.status(400).json({ error: "Erro ao deletar coach" });
      }

    default:
      return res.status(405).json({ message: "Método não permitido" });
  }
}
