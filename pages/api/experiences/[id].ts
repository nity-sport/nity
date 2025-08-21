import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../src/lib/dbConnect';
import ExperienceModel, { IExperience } from '../../../src/models/Experience';
import { getTokenFromHeader, verifyToken } from '../../../src/lib/auth';

interface ExperienceUpdateInput {
  title?: string;
  description?: string;
  coverImage?: string;
  gallery?: string[];
  category?: 'tour' | 'event';
  tags?: string[];
  location?: {
    name?: string;
    address?: string;
    coordinates?: {
      lat?: number;
      lng?: number;
    };
  };
  duration?: string;
  price?: number;
  availableQuantity?: number;
  currency?: string;
  visibility?: 'public' | 'private' | 'draft';
  isFeatured?: boolean;
  availableDates?: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res
      .status(400)
      .json({ success: false, error: 'ID da experiência é obrigatório' });
  }

  const token = getTokenFromHeader(req.headers.authorization);
  const decodedToken = token ? verifyToken(token) : null;

  switch (req.method) {
    case 'GET':
      try {
        const experience = await ExperienceModel.findById(id);

        if (!experience) {
          return res
            .status(404)
            .json({ success: false, error: 'Experiência não encontrada' });
        }

        // Check if user can view this experience
        if (
          experience.visibility !== 'public' &&
          (!decodedToken || experience.owner.userId !== decodedToken.userId)
        ) {
          return res
            .status(403)
            .json({ success: false, error: 'Acesso negado' });
        }

        res.status(200).json({ success: true, data: experience });
      } catch (error: any) {
        console.error('Erro ao buscar experiência:', error);
        res
          .status(400)
          .json({ success: false, error: error.message || 'Erro no servidor' });
      }
      break;

    case 'PUT':
      if (!decodedToken || !decodedToken.userId) {
        return res.status(401).json({
          success: false,
          error: 'Não autorizado: Token inválido ou não fornecido',
        });
      }

      try {
        const experience = await ExperienceModel.findById(id);

        if (!experience) {
          return res
            .status(404)
            .json({ success: false, error: 'Experiência não encontrada' });
        }

        // Check if user owns this experience
        if (experience.owner.userId !== decodedToken.userId) {
          return res.status(403).json({
            success: false,
            error: 'Você só pode editar suas próprias experiências',
          });
        }

        const updateData = req.body as ExperienceUpdateInput;

        // Convert availableDates to Date objects if provided
        if (updateData.availableDates) {
          (updateData as any).availableDates = updateData.availableDates.map(
            dateStr => new Date(dateStr)
          );
        }

        const updatedExperience = await ExperienceModel.findByIdAndUpdate(
          id,
          updateData,
          { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: updatedExperience });
      } catch (error: any) {
        console.error('Erro ao atualizar experiência:', error);
        res
          .status(400)
          .json({ success: false, error: error.message || 'Erro no servidor' });
      }
      break;

    case 'DELETE':
      if (!decodedToken || !decodedToken.userId) {
        return res.status(401).json({
          success: false,
          error: 'Não autorizado: Token inválido ou não fornecido',
        });
      }

      try {
        const experience = await ExperienceModel.findById(id);

        if (!experience) {
          return res
            .status(404)
            .json({ success: false, error: 'Experiência não encontrada' });
        }

        // Check if user owns this experience
        if (experience.owner.userId !== decodedToken.userId) {
          return res.status(403).json({
            success: false,
            error: 'Você só pode deletar suas próprias experiências',
          });
        }

        await ExperienceModel.findByIdAndDelete(id);
        res
          .status(200)
          .json({ success: true, message: 'Experiência deletada com sucesso' });
      } catch (error: any) {
        console.error('Erro ao deletar experiência:', error);
        res
          .status(400)
          .json({ success: false, error: error.message || 'Erro no servidor' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
