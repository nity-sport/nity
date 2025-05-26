// nity.zip/pages/api/sportcenter/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../src/lib/dbConnect";
import SportCenter from "../../../src/models/SportCenter";
import { getTokenFromHeader, verifyToken } from "../../../src/lib/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const { id } = req.query;

  const token = getTokenFromHeader(req.headers.authorization);
  let decodedUser;
  if (token) {
    decodedUser = verifyToken(token);
  }

  switch (req.method) {
    case "GET":
      try {
        const sportCenter = await SportCenter.findById(id);
        if (!sportCenter) return res.status(404).json({ message: "SportCenter não encontrado" });
        return res.status(200).json(sportCenter);
      } catch (err: any) {
        console.error("Erro ao buscar SportCenter por ID:", err);
        if (err.name === 'CastError') {
          return res.status(400).json({ error: "ID inválido" });
        }
        return res.status(500).json({ error: "Erro interno do servidor" });
      }

    case "PUT":
      if (!decodedUser || !decodedUser.userId) {
        return res.status(401).json({ message: "Não autorizado" });
      }
      try {
        const sportCenter = await SportCenter.findById(id);
        if (!sportCenter) return res.status(404).json({ message: "SportCenter não encontrado" });

        // Verifica se o usuário logado é o proprietário
        if (sportCenter.owner.toString() !== decodedUser.userId) {
          return res.status(403).json({ message: "Proibido: Você não é o proprietário deste SportCenter" });
        }

        const updatedSportCenter = await SportCenter.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        return res.status(200).json(updatedSportCenter);
      } catch (err: any) {
        console.error("Erro ao atualizar SportCenter:", err);
        if (err.name === 'ValidationError') {
          return res.status(400).json({ error: "Erro de validação", details: err.errors });
        }
        if (err.name === 'CastError') {
          return res.status(400).json({ error: "ID inválido" });
        }
        return res.status(500).json({ error: "Erro interno do servidor" });
      }

    case "DELETE":
      if (!decodedUser || !decodedUser.userId) {
        return res.status(401).json({ message: "Não autorizado" });
      }
      try {
        const sportCenter = await SportCenter.findById(id);
        if (!sportCenter) return res.status(404).json({ message: "SportCenter não encontrado" });

        if (sportCenter.owner.toString() !== decodedUser.userId) {
          return res.status(403).json({ message: "Proibido: Você não é o proprietário" });
        }

        await SportCenter.findByIdAndDelete(id);
        return res.status(204).end();
      } catch (err: any) {
        console.error("Erro ao deletar SportCenter:", err);
         if (err.name === 'CastError') {
          return res.status(400).json({ error: "ID inválido" });
        }
        return res.status(500).json({ error: "Erro interno do servidor" });
      }

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res.status(405).json({ message: `Método ${req.method} não permitido` });
  }
}