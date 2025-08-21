import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../../src/lib/dbConnect';
import ExperienceModel from '../../../../src/models/Experience';
import { getTokenFromHeader, verifyToken } from '../../../../src/lib/auth';
import User from '../../../../src/models/User';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res
      .status(400)
      .json({ success: false, error: 'ID da experiência é obrigatório' });
  }

  const token = getTokenFromHeader(req.headers.authorization);
  const decodedToken = token ? verifyToken(token) : null;

  if (!decodedToken || !decodedToken.userId) {
    return res.status(401).json({
      success: false,
      error: 'Não autorizado: Token inválido ou não fornecido',
    });
  }

  try {
    // Buscar a experiência original
    const originalExperience = await ExperienceModel.findById(id);

    if (!originalExperience) {
      return res
        .status(404)
        .json({ success: false, error: 'Experiência não encontrada' });
    }

    // Verificar se o usuário pode acessar esta experiência
    if (
      originalExperience.visibility !== 'public' &&
      originalExperience.owner.userId !== decodedToken.userId
    ) {
      return res.status(403).json({ success: false, error: 'Acesso negado' });
    }

    // Buscar dados do usuário atual
    const loggedInUser = await User.findById(decodedToken.userId).select(
      'name avatar'
    );
    if (!loggedInUser) {
      return res
        .status(404)
        .json({ success: false, error: 'Usuário logado não encontrado.' });
    }

    // Preparar dados para duplicação - mantém TODOS os dados originais
    const { newDates, title, ...otherData } = req.body;

    const duplicateData = {
      // Mantém todos os dados da experiência original
      ...originalExperience.toObject(),
      // Remove campos únicos/automáticos
      _id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
      // Sobrescreve apenas os campos necessários
      title: title || `${originalExperience.title} (Cópia)`,
      visibility: 'draft' as const, // Sempre começa como rascunho
      isFeatured: false, // Duplicatas não são destacadas por padrão
      availableDates: newDates
        ? newDates.map((date: string) => new Date(date))
        : [],
      owner: {
        userId: decodedToken.userId,
        name: loggedInUser.name,
        avatarUrl: loggedInUser.avatar || '',
      },
      // Permite sobrescrever outros campos se fornecidos
      ...otherData,
    };

    // Criar nova experiência
    const newExperience = new ExperienceModel(duplicateData);
    await newExperience.save();

    res.status(201).json({
      success: true,
      data: newExperience,
      message: 'Experiência duplicada com sucesso!',
    });
  } catch (error: any) {
    console.error('Erro ao duplicar experiência:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Erro no servidor ao duplicar experiência',
    });
  }
}
