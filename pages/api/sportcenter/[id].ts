import type { NextApiResponse } from 'next';
import dbConnect from '../../../src/lib/dbConnect';
import SportCenter from '../../../src/models/SportCenter';
import User from '../../../src/models/User';
import { getTokenFromHeader, verifyToken } from '../../../src/lib/auth';
import { ResponseHandler } from '../../../src/utils/apiResponse';
import { 
  AuthenticationError, 
  AuthorizationError, 
  NotFoundError,
  ValidationError,
  DatabaseError
} from '../../../src/utils/errors';
import { withErrorHandler, withMethods, ApiRequest } from '../../../src/middleware/errorHandler';
import { logger } from '../../../src/utils/logger';

async function getSportCenter(req: ApiRequest, res: NextApiResponse) {
  const startTime = Date.now();

  try {
    await dbConnect();
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      throw new ValidationError('ID do SportCenter é obrigatório');
    }

    logger.dbOperation('findById', 'sportcenters', undefined, { 
      requestId: req.requestId,
      sportCenterId: id 
    });

    const sportCenter = await SportCenter.findById(id);
    
    if (!sportCenter) {
      throw new NotFoundError('SportCenter');
    }

    logger.dbOperation('findById', 'sportcenters', Date.now() - startTime, { 
      requestId: req.requestId,
      sportCenterId: id,
      found: true
    });

    return ResponseHandler.success(res, {
      ...sportCenter.toObject(),
      _id: sportCenter._id.toString()
    }, {
      requestId: req.requestId
    });

  } catch (error) {
    if (error instanceof Error && error.name === 'CastError') {
      throw new ValidationError('ID inválido');
    }
    
    logger.dbError('findById', 'sportcenters', error instanceof Error ? error.message : String(error), {
      requestId: req.requestId,
      sportCenterId: req.query.id as string
    });
    throw error;
  }
}

async function updateSportCenter(req: ApiRequest, res: NextApiResponse) {
  const startTime = Date.now();

  try {
    await dbConnect();
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      throw new ValidationError('ID do SportCenter é obrigatório');
    }

    const token = getTokenFromHeader(req.headers.authorization);
    const decodedUser = token ? verifyToken(token) : null;

    if (!decodedUser || !decodedUser.userId) {
      throw new AuthenticationError();
    }

    const sportCenter = await SportCenter.findById(id);
    if (!sportCenter) {
      throw new NotFoundError('SportCenter');
    }

    // Check user permissions
    const user = await User.findById(decodedUser.userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Only owner or superuser can update
    const isOwner = sportCenter.owner.toString() === decodedUser.userId;
    const isSuperuser = user.role === 'SUPERUSER';

    if (!isOwner && !isSuperuser) {
      logger.authError('Unauthorized sport center update attempt', {
        userId: decodedUser.userId,
        userRole: user.role,
        sportCenterId: id,
        isOwner,
        requestId: req.requestId
      });
      throw new AuthorizationError('Apenas o proprietário ou administrador podem editar');
    }

    logger.dbOperation('findByIdAndUpdate', 'sportcenters', undefined, { 
      requestId: req.requestId,
      sportCenterId: id 
    });

    const updatedSportCenter = await SportCenter.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedSportCenter) {
      throw new NotFoundError('SportCenter');
    }

    logger.info('SportCenter updated successfully', {
      sportCenterId: id,
      updatedBy: decodedUser.userId,
      requestId: req.requestId
    });

    logger.dbOperation('findByIdAndUpdate', 'sportcenters', Date.now() - startTime, { 
      requestId: req.requestId,
      sportCenterId: id,
      success: true
    });

    return ResponseHandler.success(res, {
      ...updatedSportCenter.toObject(),
      _id: updatedSportCenter._id.toString()
    }, {
      message: 'SportCenter atualizado com sucesso',
      requestId: req.requestId
    });

  } catch (error) {
    if (error instanceof Error && error.name === 'CastError') {
      throw new ValidationError('ID inválido');
    }
    
    if (error instanceof Error && error.name === 'ValidationError') {
      throw new DatabaseError('Erro de validação dos dados', {
        details: error.message
      });
    }

    logger.dbError('findByIdAndUpdate', 'sportcenters', error instanceof Error ? error.message : String(error), {
      requestId: req.requestId,
      sportCenterId: req.query.id as string
    });
    throw error;
  }
}

async function deleteSportCenter(req: ApiRequest, res: NextApiResponse) {
  const startTime = Date.now();

  try {
    await dbConnect();
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      throw new ValidationError('ID do SportCenter é obrigatório');
    }

    const token = getTokenFromHeader(req.headers.authorization);
    const decodedUser = token ? verifyToken(token) : null;

    if (!decodedUser || !decodedUser.userId) {
      throw new AuthenticationError();
    }

    const sportCenter = await SportCenter.findById(id);
    if (!sportCenter) {
      throw new NotFoundError('SportCenter');
    }

    // Check user permissions
    const user = await User.findById(decodedUser.userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Only owner or superuser can delete
    const isOwner = sportCenter.owner.toString() === decodedUser.userId;
    const isSuperuser = user.role === 'SUPERUSER';

    if (!isOwner && !isSuperuser) {
      logger.authError('Unauthorized sport center deletion attempt', {
        userId: decodedUser.userId,
        userRole: user.role,
        sportCenterId: id,
        isOwner,
        requestId: req.requestId
      });
      throw new AuthorizationError('Apenas o proprietário ou administrador podem excluir');
    }

    logger.dbOperation('findByIdAndDelete', 'sportcenters', undefined, { 
      requestId: req.requestId,
      sportCenterId: id 
    });

    await SportCenter.findByIdAndDelete(id);

    logger.info('SportCenter deleted successfully', {
      sportCenterId: id,
      deletedBy: decodedUser.userId,
      requestId: req.requestId
    });

    logger.dbOperation('findByIdAndDelete', 'sportcenters', Date.now() - startTime, { 
      requestId: req.requestId,
      sportCenterId: id,
      success: true
    });

    return ResponseHandler.success(res, null, {
      message: 'SportCenter excluído com sucesso',
      requestId: req.requestId
    });

  } catch (error) {
    if (error instanceof Error && error.name === 'CastError') {
      throw new ValidationError('ID inválido');
    }

    logger.dbError('findByIdAndDelete', 'sportcenters', error instanceof Error ? error.message : String(error), {
      requestId: req.requestId,
      sportCenterId: req.query.id as string
    });
    throw error;
  }
}

async function handler(req: ApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getSportCenter(req, res);
    case 'PUT':
      return updateSportCenter(req, res);
    case 'DELETE':
      return deleteSportCenter(req, res);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return ResponseHandler.error(
        res,
        new Error(`Método ${req.method} não permitido`),
        req.requestId
      );
  }
}

export default withMethods(['GET', 'PUT', 'DELETE'])(withErrorHandler(handler));