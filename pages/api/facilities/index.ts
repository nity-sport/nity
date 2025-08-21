import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../src/lib/dbConnect';
import Facility from '../../../src/models/Facility';
import { getTokenFromHeader, verifyToken } from '../../../src/lib/auth';
import User from '../../../src/models/User';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  const token = getTokenFromHeader(req.headers.authorization);
  const decodedToken = token ? verifyToken(token) : null;

  switch (req.method) {
    case 'GET':
      try {
        // Public endpoint - anyone can view facilities
        const { search, limit = '50' } = req.query;
        const limitNum = parseInt(limit as string);

        const query: any = {};

        // Add search filter if provided
        if (search) {
          query.name = { $regex: search, $options: 'i' };
        }

        const facilities = await Facility.find(query)
          .sort({ name: 1 })
          .limit(limitNum)
          .lean()
          .exec();

        const formattedFacilities = facilities.map(facility => ({
          ...facility,
          _id: facility._id.toString(),
        }));

        return res.status(200).json({
          facilities: formattedFacilities,
          count: facilities.length,
        });
      } catch (err) {
        console.error('❌ Erro ao buscar Facilities:', err);
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

    case 'POST':
      // Only authenticated users can create facilities
      if (!decodedToken?.userId) {
        return res.status(401).json({ message: 'Não autorizado' });
      }

      try {
        const user = await User.findById(decodedToken.userId);
        if (!user || user.role !== 'SUPERUSER') {
          return res.status(403).json({
            message:
              'Permissão negada. Apenas superusuários podem gerenciar facilities.',
          });
        }

        const { name, icon } = req.body;

        if (!name) {
          return res.status(400).json({ error: 'Nome é obrigatório' });
        }

        // Check if facility with same name already exists
        const existingFacility = await Facility.findOne({
          name: { $regex: `^${name}$`, $options: 'i' },
        });

        if (existingFacility) {
          return res
            .status(400)
            .json({ error: 'Facility com este nome já existe' });
        }

        const facility = new Facility({
          name: name.trim(),
          icon: icon?.trim() || undefined,
        });

        await facility.save();

        return res.status(201).json({
          ...facility.toObject(),
          _id: facility._id.toString(),
        });
      } catch (err: any) {
        console.error('❌ Erro ao criar Facility:', err);
        if (err.name === 'ValidationError') {
          return res
            .status(400)
            .json({ error: 'Erro de validação', details: err.errors });
        }
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res
        .status(405)
        .json({ message: `Método ${req.method} não permitido` });
  }
}
