import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../src/lib/dbConnect';
import ExperienceModel, { IExperience } from '../../src/models/Experience';
import { getTokenFromHeader, verifyToken } from '../../src/lib/auth';
import User from '../../src/models/User'; // Para buscar nome e avatar do owner no POST

interface ExperienceInput {
  title: string;
  description: string;
  coverImage: string;
  gallery?: string[];
  category: 'tour' | 'event';
  tags?: string[];
  location: {
    name: string;
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  duration?: string;
  price: number;
  availableQuantity: number;
  currency?: string;
  visibility: 'public' | 'private' | 'draft';
  isFeatured?: boolean;
  availableDates: string[];
}

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
        // Extract query parameters
        const { page = '1', limit = '12', search, visibility } = req.query;
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        // Build query based on user permissions and filters
        let query: any = {};

        // If user is authenticated and has permissions, they can see all their experiences
        // Otherwise, only show public experiences
        if (decodedToken?.userId) {
          // Authenticated users can see their own experiences with any visibility
          // Plus all public experiences from others
          if (visibility && visibility !== 'all') {
            query = {
              $or: [
                { 'owner.userId': decodedToken.userId, visibility: visibility },
                {
                  'owner.userId': { $ne: decodedToken.userId },
                  visibility: 'public',
                },
              ],
            };
          } else {
            query = {
              $or: [
                { 'owner.userId': decodedToken.userId },
                {
                  'owner.userId': { $ne: decodedToken.userId },
                  visibility: 'public',
                },
              ],
            };
          }
        } else {
          // Non-authenticated users only see public experiences
          query.visibility = 'public';
        }

        // Add search filter if provided
        if (search) {
          query.$and = query.$and || [];
          query.$and.push({
            $or: [
              { title: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } },
              { category: { $regex: search, $options: 'i' } },
              { 'location.name': { $regex: search, $options: 'i' } },
              { 'location.address': { $regex: search, $options: 'i' } },
              { tags: { $in: [new RegExp(search as string, 'i')] } },
            ],
          });
        }

        // Get total count for pagination
        const total = await ExperienceModel.countDocuments(query);
        const totalPages = Math.ceil(total / limitNum);

        // Fetch experiences with pagination
        const experiences = await ExperienceModel.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum);

        // Build pagination info
        const pagination = {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        };

        res.status(200).json({
          experiences,
          pagination,
        });
      } catch (error: any) {
        console.error('Erro ao buscar Experiences:', error);
        res.status(400).json({
          success: false,
          error: error.message || 'Erro no servidor ao buscar experiências',
        });
      }
      break;

    case 'POST':
      if (!decodedToken || !decodedToken.userId) {
        return res
          .status(401)
          .json({ message: 'Não autorizado: Token inválido ou não fornecido' });
      }

      const loggedInUser = await User.findById(decodedToken.userId).select(
        'name avatar'
      );
      if (!loggedInUser) {
        return res
          .status(404)
          .json({ message: 'Usuário logado não encontrado.' });
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
          availableDates: experienceData.availableDates.map(
            dateStr => new Date(dateStr)
          ),
        };

        if (
          !fullExperienceData.title ||
          !fullExperienceData.description ||
          !fullExperienceData.coverImage ||
          !fullExperienceData.category ||
          fullExperienceData.price === undefined ||
          !fullExperienceData.location?.name ||
          !fullExperienceData.location?.address ||
          fullExperienceData.location?.coordinates?.lat === undefined ||
          fullExperienceData.location?.coordinates?.lng === undefined
        ) {
          return res.status(400).json({
            success: false,
            error:
              'Campos obrigatórios faltando: título, descrição, imagem de capa, categoria, preço e localização completa.',
          });
        }

        const newExperience = new ExperienceModel(fullExperienceData);
        await newExperience.save();
        res.status(201).json({ success: true, data: newExperience });
      } catch (error: any) {
        console.error('Erro ao criar Experience:', error);
        res.status(400).json({
          success: false,
          error: error.message || 'Erro no servidor ao criar experiência',
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
