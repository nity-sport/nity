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
  const { id } = req.query;

  const token = getTokenFromHeader(req.headers.authorization);
  const decodedToken = token ? verifyToken(token) : null;

  switch (req.method) {
    case 'GET':
      try {
        const facility = await Facility.findById(id);
        if (!facility) {
          return res.status(404).json({ message: 'Facility não encontrada' });
        }

        return res.status(200).json({
          ...facility.toObject(),
          _id: facility._id.toString(),
        });
      } catch (err: any) {
        console.error('Erro ao buscar Facility por ID:', err);
        if (err.name === 'CastError') {
          return res.status(400).json({ error: 'ID inválido' });
        }
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

    case 'PUT':
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

        const facility = await Facility.findById(id);
        if (!facility) {
          return res.status(404).json({ message: 'Facility não encontrada' });
        }

        const { name, icon } = req.body;

        if (!name) {
          return res.status(400).json({ error: 'Nome é obrigatório' });
        }

        // Check if another facility with same name exists (excluding current one)
        const existingFacility = (await Facility.findOne({
          _id: { $ne: id },
          name: { $regex: `^${name}$`, $options: 'i' },
        })) as any;

        if (existingFacility) {
          return res
            .status(400)
            .json({ error: 'Facility com este nome já existe' });
        }

        const updatedFacility = (await Facility.findByIdAndUpdate(
          id,
          {
            name: name.trim(),
            icon: icon?.trim() || undefined,
          },
          { new: true, runValidators: true }
        )) as any;

        return res.status(200).json({
          ...updatedFacility.toObject(),
          _id: updatedFacility._id.toString(),
        });
      } catch (err: any) {
        console.error('Erro ao atualizar Facility:', err);
        if (err.name === 'ValidationError') {
          return res
            .status(400)
            .json({ error: 'Erro de validação', details: err.errors });
        }
        if (err.name === 'CastError') {
          return res.status(400).json({ error: 'ID inválido' });
        }
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

    case 'DELETE':
      if (!decodedToken?.userId) {
        return res.status(401).json({ message: 'Não autorizado' });
      }

      try {
        const user = await User.findById(decodedToken.userId);
        if (!user || !['SUPERUSER', 'OWNER'].includes(user.role)) {
          return res.status(403).json({ message: 'Permissão negada' });
        }

        const facility = await Facility.findById(id);
        if (!facility) {
          return res.status(404).json({ message: 'Facility não encontrada' });
        }

        (await Facility.findByIdAndDelete(id)) as any;
        return res.status(204).end();
      } catch (err: any) {
        console.error('Erro ao deletar Facility:', err);
        if (err.name === 'CastError') {
          return res.status(400).json({ error: 'ID inválido' });
        }
        return res.status(500).json({ error: 'Erro interno do servidor' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res
        .status(405)
        .json({ message: `Método ${req.method} não permitido` });
  }
}
