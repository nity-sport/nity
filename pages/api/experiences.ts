import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../src/lib/dbConnect';
import ExperienceModel, { IExperience } from '../../src/models/Experience';
import { getTokenFromHeader, verifyToken } from '../../src/lib/auth';
import User from '../../src/models/User'; // Para buscar nome e avatar do owner no POST

interface ExperienceInput {
  title: string;
  description: string;
  coverImage: string;
  category: string;
  price: number;
  visibility: 'public' | 'private' | 'draft';
  availableDates: string[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const token = getTokenFromHeader(req.headers.authorization);
  const decodedToken = token ? verifyToken(token) : null;

  switch (req.method) {
    case 'GET':
      try {
        // Filtra para mostrar apenas 'public' se não houver usuário logado ou
        // se o usuário logado não for o dono.
        // Se o usuário estiver logado e quiser ver as suas próprias (incluindo draft/private),
        // precisaria de um parâmetro extra, ex: /api/experiences?mine=true
        // Por agora, vamos retornar todas as publicas para todos, e logados podem ver as suas.
        // Ou, podemos simplesmente retornar todas e o frontend filtra se necessário.
        // Para um componente genérico, retornar todas as publicas é mais seguro.
        // Se for para uma área de "Minhas Experiências", o filtro por owner.userId seria aqui.

        // Simples: Retorna todas as experiências públicas
        // Futuramente, pode-se adicionar paginação, filtros por categoria, etc.
        const experiences = await ExperienceModel.find({ visibility: 'public' }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: experiences });
      } catch (error: any) {
        console.error("Erro ao buscar Experiences:", error);
        res.status(400).json({ success: false, error: error.message || 'Erro no servidor ao buscar experiências' });
      }
      break;

    case 'POST':
      if (!decodedToken || !decodedToken.userId) {
        return res.status(401).json({ message: 'Não autorizado: Token inválido ou não fornecido' });
      }

      const loggedInUser = await User.findById(decodedToken.userId).select('name avatar');
      if (!loggedInUser) {
        return res.status(404).json({ message: 'Usuário logado não encontrado.' });
      }

      try {
        const experienceData = req.body as ExperienceInput;
        
        const fullExperienceData = {
          ...experienceData,
          owner: {
            userId: decodedToken.userId,
            name: loggedInUser.name,
            avatarUrl: loggedInUser.avatar || '',
          },
          availableDates: experienceData.availableDates.map(dateStr => new Date(dateStr)),
        };

        if (!fullExperienceData.title || !fullExperienceData.description || !fullExperienceData.coverImage || !fullExperienceData.category || fullExperienceData.price === undefined) {
          return res.status(400).json({ success: false, error: 'Campos obrigatórios faltando.' });
        }

        const newExperience = new ExperienceModel(fullExperienceData);
        await newExperience.save();
        res.status(201).json({ success: true, data: newExperience });
      } catch (error: any) {
        console.error("Erro ao criar Experience:", error);
        res.status(400).json({ success: false, error: error.message || 'Erro no servidor ao criar experiência' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}