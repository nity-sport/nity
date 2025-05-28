
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../src/lib/dbConnect";
import SportCenter from "../../../src/models/SportCenter";
import { SportCenterType } from "../../../src/types/sportcenter";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SportCenterType | SportCenterType[] | { message: string; error?: any }>
) {
  await dbConnect();

  switch (req.method) {
    case "GET":
      try {
        const sportCenters = await SportCenter.find({}).lean().exec();

        const formattedSportCenters = sportCenters.map(center => ({
          ...center,
          _id: center._id.toString(),
        })) as SportCenterType[];

        return res.status(200).json(formattedSportCenters);
      } catch (err) {
        console.error("❌ Erro ao buscar SportCenters:", err);
        return res
          .status(500)
          .json({ message: "Erro ao buscar centros de treinamento", error: err });
      }

    
    case "POST":
      try {
        console.log("📥 Recebido para criar SportCenter:", req.body);
        const sportCenter = await SportCenter.create(req.body);
        const createdCenter = { ...sportCenter.toObject(), _id: sportCenter._id.toString() };
        return res.status(201).json(createdCenter);
      } catch (err) {
        console.error("❌ Erro ao criar SportCenter:", err);
        return res.status(400).json({ message: "Erro ao criar SportCenter", error: err });
      }

    default:
      res.setHeader("Allow", ["GET"]);
      return res.status(405).json({ message: `Método ${req.method} não permitido` });
  }
}