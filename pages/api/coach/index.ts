import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../src/lib/dbConnect';
import Coach from '../../../src/models/Coach';
import { authenticateToken } from '../../../src/lib/auth-middleware';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        // GET requests can be public or authenticated
        const { page = '1', limit = '10', search = '', public: _ } = req.query;

        const pageNum = parseInt(page as string, 10);
        const limitNum = parseInt(limit as string, 10);
        const skip = (pageNum - 1) * limitNum;

        // Build search filter
        const searchFilter = search
          ? {
              $or: [
                { name: { $regex: search, $options: 'i' } },
                { miniBio: { $regex: search, $options: 'i' } },
              ],
            }
          : {};

        const coaches = await Coach.find(searchFilter)
          .skip(skip)
          .limit(limitNum)
          .sort({ createdAt: -1 });

        const total = await Coach.countDocuments(searchFilter);

        return res.status(200).json({
          coaches,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
          },
        });
      } catch (error) {
        console.error('Error fetching coaches:', error);
        return res.status(500).json({ error: 'Erro ao buscar coaches' });
      }

    case 'POST':
      try {
        // Only authenticated users with permissions can create coaches
        const user = await authenticateToken(req, res);
        if (!user) return;

        // Check if user has permission to manage coaches (SUPERUSER only)
        if (user.role !== 'SUPERUSER') {
          return res
            .status(403)
            .json({ error: 'Apenas superusuários podem gerenciar coaches' });
        }

        const coach = await Coach.create(req.body);
        return res.status(201).json(coach);
      } catch (err: any) {
        console.error('Error creating coach:', err);
        return res.status(400).json({
          error: 'Erro ao criar coach',
          details: err.message,
        });
      }

    default:
      return res.status(405).json({ message: 'Método não permitido' });
  }
}
