// nity.zip/pages/api/sportcenter/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../src/lib/dbConnect";
import SportCenter from "../../../src/models/SportCenter";
import User from "../../../src/models/User";
import { getTokenFromHeader, verifyToken } from "../../../src/lib/auth";
import { SportCenterType } from "../../../src/types/sportcenter";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const token = getTokenFromHeader(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ message: "Não autorizado: Sem token" });
  }

  const decodedUser = verifyToken(token);
  if (!decodedUser || !decodedUser.userId) {
    return res.status(401).json({ message: "Não autorizado: Token inválido" });
  }

  switch (req.method) {
    case "GET":
      try {
        // Opcional: Listar SportCenters do usuário logado ou todos se admin
        const sportCenters = await SportCenter.find({ owner: decodedUser.userId });
        return res.status(200).json(sportCenters);
      } catch (err) {
        console.error("Erro ao buscar SportCenters:", err);
        return res.status(500).json({ error: "Erro ao buscar SportCenters", detail: err });
      }

    case "POST":
      try {
        const sportCenterData = req.body as SportCenterType;

        // Garante que o 'owner' é o usuário autenticado
        sportCenterData.owner = decodedUser.userId;

        // Busca o email do usuário para ownerMail se não fornecido
        if (!sportCenterData.ownerMail) {
          const ownerInfo = await User.findById(decodedUser.userId).select('email');
          if (ownerInfo) {
            sportCenterData.ownerMail = ownerInfo.email;
          }
        }
        
        console.log("📥 Recebido para criar SportCenter:", sportCenterData);
        const newSportCenter = await SportCenter.create(sportCenterData);
        return res.status(201).json(newSportCenter);
      } catch (err: any) {
        console.error("❌ Erro ao criar SportCenter:", err);
        // Mongoose validation errors can be in err.errors
        if (err.name === 'ValidationError') {
          return res.status(400).json({ error: "Erro de validação ao criar SportCenter", details: err.errors });
        }
        return res.status(400).json({ error: "Erro ao criar SportCenter", detail: err.message || err });
      }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).json({ message: `Método ${req.method} não permitido` });
  }
}