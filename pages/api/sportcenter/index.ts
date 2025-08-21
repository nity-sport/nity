import type { NextApiResponse } from 'next';
import dbConnect from '../../../src/lib/dbConnect';
import SportCenter from '../../../src/models/SportCenter';
import User from '../../../src/models/User';
import { SportCenterType } from '../../../src/types/sportcenter';
import { getTokenFromHeader, verifyToken } from '../../../src/lib/auth';
import { ResponseHandler } from '../../../src/utils/apiResponse';
import { 
  AuthenticationError, 
  AuthorizationError, 
  ValidationError,
  DatabaseError,
  NotFoundError
} from '../../../src/utils/errors';
import { withErrorHandler, withMethods, ApiRequest } from '../../../src/middleware/errorHandler';
import { logger } from '../../../src/utils/logger';

interface SportCentersResponse {
  sportCenters: SportCenterType[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

async function getSportCenters(req: ApiRequest, res: NextApiResponse) {
  const startTime = Date.now();
  
  try {
    await dbConnect();
    logger.dbOperation('connect', 'sportcenters', undefined, { requestId: req.requestId });

    const token = getTokenFromHeader(req.headers.authorization);
    const decodedToken = token ? verifyToken(token) : null;

    // Extract and validate query parameters
    const {
      page = '1',
      limit = '12',
      search,
      owner,
      public: isPublic,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      throw new ValidationError('Invalid pagination parameters', { page: pageNum, limit: limitNum });
    }

    const skip = (pageNum - 1) * limitNum;

    // Build query based on parameters
    const query: any = {};

    // Authentication and authorization logic
    if (owner) {
      query.owner = owner;
    } else if (isPublic) {
      // Show all public sport centers
    } else if (decodedToken?.userId) {
      const user = await User.findById(decodedToken.userId);
      if (!user) {
        throw new NotFoundError('User');
      }
      
      if (user.role === 'OWNER') {
        query.owner = decodedToken.userId;
      }
    }

    // Add search filter if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sportcenterBio: { $regex: search, $options: 'i' } },
        { sport: { $in: [new RegExp(search as string, 'i')] } },
        { categories: { $in: [new RegExp(search as string, 'i')] } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.state': { $regex: search, $options: 'i' } },
        { 'location.country': { $regex: search, $options: 'i' } },
      ];
    }

    // Get total count and sport centers
    const [total, sportCenters] = await Promise.all([
      SportCenter.countDocuments(query),
      SportCenter.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean()
        .exec()
    ]);

    logger.dbOperation('find', 'sportcenters', Date.now() - startTime, { 
      requestId: req.requestId, 
      query: JSON.stringify(query),
      count: sportCenters.length
    });

    const formattedSportCenters = sportCenters.map(center => ({
      ...center,
      _id: center._id.toString(),
    })) as SportCenterType[];

    const pagination = {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      hasNextPage: pageNum * limitNum < total,
      hasPrevPage: pageNum > 1,
    };

    logger.apiResponse(
      req.method || 'GET', 
      req.url || '/api/sportcenter', 
      200, 
      Date.now() - startTime,
      { requestId: req.requestId }
    );

    return ResponseHandler.paginated(res, formattedSportCenters, pagination, {
      requestId: req.requestId
    });

  } catch (error) {
    logger.dbError('find', 'sportcenters', error instanceof Error ? error.message : String(error), {
      requestId: req.requestId,
      duration: Date.now() - startTime
    });
    throw error;
  }
}

async function createSportCenter(req: ApiRequest, res: NextApiResponse) {
  const startTime = Date.now();

  try {
    await dbConnect();

    const token = getTokenFromHeader(req.headers.authorization);
    const decodedToken = token ? verifyToken(token) : null;

    if (!decodedToken || !decodedToken.userId) {
      throw new AuthenticationError('Token inválido ou não fornecido');
    }

    // Check user permissions
    const user = await User.findById(decodedToken.userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    if (user.role !== 'OWNER' && user.role !== 'SUPERUSER') {
      logger.authError('Unauthorized sport center creation attempt', {
        userId: decodedToken.userId,
        userRole: user.role,
        requestId: req.requestId
      });
      throw new AuthorizationError('Apenas owners podem criar sportcenters');
    }

    // Validate required fields
    const { name, sport, location } = req.body;
    if (!name || !sport || !location) {
      throw new ValidationError('Campos obrigatórios não preenchidos', {
        missing: {
          name: !name,
          sport: !sport,
          location: !location
        }
      });
    }

    const sportCenterData = {
      ...req.body,
      owner: decodedToken.userId,
    };

    logger.dbOperation('create', 'sportcenters', undefined, { requestId: req.requestId });

    const sportCenter = await SportCenter.create(sportCenterData);
    
    const createdCenter = {
      ...sportCenter.toObject(),
      _id: sportCenter._id.toString(),
    } as SportCenterType;

    logger.info('SportCenter created successfully', {
      sportCenterId: createdCenter._id,
      ownerId: decodedToken.userId,
      name: createdCenter.name,
      requestId: req.requestId
    });

    logger.apiResponse(
      req.method || 'POST', 
      req.url || '/api/sportcenter', 
      201, 
      Date.now() - startTime,
      { requestId: req.requestId }
    );

    return ResponseHandler.created(
      res, 
      createdCenter, 
      'SportCenter criado com sucesso',
      req.requestId
    );

  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationError') {
      throw new DatabaseError('Erro de validação dos dados', {
        details: error.message,
        duration: Date.now() - startTime
      });
    }
    
    logger.dbError('create', 'sportcenters', error instanceof Error ? error.message : String(error), {
      requestId: req.requestId,
      duration: Date.now() - startTime
    });
    throw error;
  }
}

async function handler(req: ApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getSportCenters(req, res);
    case 'POST':
      return createSportCenter(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return ResponseHandler.error(
        res,
        new Error(`Método ${req.method} não permitido`),
        req.requestId
      );
  }
}

export default withMethods(['GET', 'POST'])(withErrorHandler(handler));