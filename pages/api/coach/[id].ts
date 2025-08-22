import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../src/lib/dbConnect';
import Coach from '../../../src/models/Coach';
import { authenticateToken } from '../../../src/lib/auth-middleware';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();
  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      try {
        const coach = await Coach.findById(id);
        if (!coach) {
          return res.status(404).json({ message: 'Coach não encontrado' });
        }
        return res.status(200).json(coach);
      } catch (_) {
        return res.status(400).json({ error: 'ID inválido' });
      }

    case 'PUT':
      try {
        // Only authenticated superusers can update coaches
        const user = await authenticateToken(req, res);
        if (!user) return;

        if (user.role !== 'SUPERUSER') {
          return res
            .status(403)
            .json({ error: 'Apenas superusuários podem atualizar coaches' });
        }

        const updated = await Coach.findByIdAndUpdate(id, req.body, {
          new: true,
        });
        if (!updated) {
          return res.status(404).json({ error: 'Coach não encontrado' });
        }
        return res.status(200).json(updated);
      } catch (err: any) {
        console.error('Error updating coach:', err);
        return res.status(400).json({
          error: 'Erro ao atualizar coach',
          details: err.message,
        });
      }

    case 'DELETE':
      try {
        // Only authenticated superusers can delete coaches
        const user = await authenticateToken(req, res);
        if (!user) return;

        if (user.role !== 'SUPERUSER') {
          return res
            .status(403)
            .json({ error: 'Apenas superusuários podem deletar coaches' });
        }

        const deleted = await Coach.findByIdAndDelete(id);
        if (!deleted) {
          return res.status(404).json({ error: 'Coach não encontrado' });
        }
        return res.status(204).end();
      } catch (err: any) {
        console.error('Error deleting coach:', err);
        return res.status(400).json({
          error: 'Erro ao deletar coach',
          details: err.message,
        });
      }

    default:
      return res.status(405).json({ message: 'Método não permitido' });
  }
}
