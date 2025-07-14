// pages/api/sports/suggested.ts
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../src/lib/dbConnect';
import Sport from '../../../src/models/Sport';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const suggestedSports = await Sport.find({ status: 'sugerido', isActive: true })
          .select('name icon status createdAt')
          .sort({ createdAt: -1 });

        res.status(200).json({
          success: true,
          data: suggestedSports
        });
      } catch (error) {
        console.error('Error fetching suggested sports:', error);
        res.status(500).json({
          success: false,
          error: 'Erro ao buscar esportes sugeridos'
        });
      }
      break;

    case 'PATCH':
      try {
        const { id, action } = req.body;

        if (!id || !action) {
          return res.status(400).json({
            success: false,
            error: 'ID e ação são obrigatórios'
          });
        }

        if (action === 'accept') {
          await Sport.findByIdAndUpdate(id, { status: 'aceito' });
        } else if (action === 'reject') {
          await Sport.findByIdAndUpdate(id, { isActive: false });
        }

        res.status(200).json({
          success: true,
          message: action === 'accept' ? 'Esporte aceito' : 'Esporte rejeitado'
        });
      } catch (error) {
        console.error('Error updating sport status:', error);
        res.status(500).json({
          success: false,
          error: 'Erro ao atualizar esporte'
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PATCH']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}