
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../src/lib/dbConnect";
import SportCenter from "../../../src/models/SportCenter";
import User from "../../../src/models/User";
import { SportCenterType } from "../../../src/types/sportcenter";
import { getTokenFromHeader, verifyToken } from "../../../src/lib/auth";

interface SportCentersResponse {
  sportCenters: SportCenterType[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SportCenterType | SportCentersResponse | { message: string; error?: any }>
) {
  await dbConnect();

  const token = getTokenFromHeader(req.headers.authorization);
  const decodedToken = token ? verifyToken(token) : null;

  switch (req.method) {
    case "GET":
      try {
        console.log("[API SportCenter] GET request received", { query: req.query });
        // Extract query parameters
        const { page = '1', limit = '12', search, owner, public: isPublic } = req.query;
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        // Build query based on parameters
        let query: any = {};

        // If owner parameter is provided, filter by owner
        if (owner) {
          query.owner = owner;
        }
        // If public parameter is provided, show all sport centers (no owner filter)
        else if (isPublic) {
          console.log("[API SportCenter] Public request - showing all sportcenters");
          // No additional filters, show all public sportcenters
        }
        // If authenticated user is OWNER, show only their sport centers  
        else if (decodedToken?.userId) {
          const user = await User.findById(decodedToken.userId);
          console.log("[API SportCenter] Authenticated user:", user?.role);
          if (user && user.role === 'OWNER') {
            console.log("[API SportCenter] Owner user - filtering by owner");
            query.owner = decodedToken.userId;
          }
        }
        // For unauthenticated users without public flag, show all sportcenters too
        else {
          console.log("[API SportCenter] Unauthenticated user - showing all sportcenters");
        }

        // Add search filter if provided
        if (search) {
          query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { sportcenterBio: { $regex: search, $options: 'i' } },
            { sport: { $in: [new RegExp(search as string, 'i')] } },
            { categories: { $in: [new RegExp(search as string, 'i')] } },
            { 'location.city': { $regex: search, $options: 'i' } },
            { 'location.state': { $regex: search, $options: 'i' } },
            { 'location.country': { $regex: search, $options: 'i' } }
          ];
        }

        // Get total count for pagination
        const total = await SportCenter.countDocuments(query);
        const totalPages = Math.ceil(total / limitNum);

        console.log("[API SportCenter] Query built:", query);
        console.log("[API SportCenter] Total count:", total);

        // Fetch sport centers with pagination
        const sportCenters = await SportCenter.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean()
          .exec();

        console.log("[API SportCenter] Found sportCenters:", sportCenters.length);

        const formattedSportCenters = sportCenters.map(center => ({
          ...center,
          _id: center._id.toString(),
        })) as SportCenterType[];

        // Build pagination info
        const pagination = {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        };

        console.log("[API SportCenter] Returning response with", formattedSportCenters.length, "sportCenters");
        return res.status(200).json({ 
          sportCenters: formattedSportCenters,
          pagination
        });
      } catch (err) {
        console.error("❌ Erro ao buscar SportCenters:", err);
        return res
          .status(500)
          .json({ message: "Erro ao buscar centros de treinamento", error: err });
      }

    
    case "POST":
      if (!decodedToken || !decodedToken.userId) {
        return res.status(401).json({ message: 'Não autorizado: Token inválido ou não fornecido' });
      }

      // Check if user can manage sport centers (OWNER or SUPERUSER)
      const user = await User.findById(decodedToken.userId);
      if (!user || (user.role !== 'OWNER' && user.role !== 'SUPERUSER')) {
        return res.status(403).json({ message: 'Acesso negado: Apenas owners podem criar sportcenters' });
      }

      try {
        console.log("📥 Recebido para criar SportCenter:", req.body);
        
        const sportCenterData = {
          ...req.body,
          owner: decodedToken.userId, // Set owner to authenticated user
        };

        const sportCenter = await SportCenter.create(sportCenterData);
        const createdCenter = { ...sportCenter.toObject(), _id: sportCenter._id.toString() };
        return res.status(201).json(createdCenter);
      } catch (err) {
        console.error("❌ Erro ao criar SportCenter:", err);
        return res.status(400).json({ message: "Erro ao criar SportCenter", error: err });
      }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res.status(405).json({ message: `Método ${req.method} não permitido` });
  }
}