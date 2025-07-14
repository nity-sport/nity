// pages/api/sports.ts
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../src/lib/dbConnect';
import Sport from '../../src/models/Sport';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const sports = await Sport.find({ isActive: true, status: 'aceito' })
          .select('name icon')
          .sort({ name: 1 });

        res.status(200).json({
          success: true,
          data: sports
        });
      } catch (error) {
        console.error('Error fetching sports:', error);
        res.status(500).json({
          success: false,
          error: 'Erro ao buscar esportes'
        });
      }
      break;

    case 'POST':
      try {
        const { name, icon } = req.body;

        if (!name) {
          return res.status(400).json({
            success: false,
            error: 'Nome do esporte é obrigatório'
          });
        }

        const sport = await Sport.create({
          name: name.trim(),
          icon,
          status: 'sugerido'
        });

        res.status(201).json({
          success: true,
          data: sport
        });
      } catch (error: any) {
        console.error('Error creating sport:', error);
        
        if (error.code === 11000) {
          return res.status(400).json({
            success: false,
            error: 'Esporte já cadastrado'
          });
        }

        res.status(500).json({
          success: false,
          error: 'Erro ao criar esporte'
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}