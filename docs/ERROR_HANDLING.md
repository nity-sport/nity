# Sistema de Tratamento de Erros

Este documento descreve o sistema padronizado de tratamento de erros implementado no projeto Nity.

## Visão Geral

O sistema de tratamento de erros consiste em três componentes principais:

1. **Classes de erro customizadas** (`src/utils/errors.ts`)
2. **Sistema padronizado de respostas** (`src/utils/apiResponse.ts`)
3. **Middleware de tratamento de erros** (`src/middleware/errorHandler.ts`)
4. **Sistema de logging estruturado** (`src/utils/logger.ts`)

## Classes de Erro

### AppError (Classe Base)

```typescript
import { AppError, ErrorCode } from '../src/utils/errors';

// Erro genérico
throw new AppError('Mensagem do erro', ErrorCode.INTERNAL_ERROR, 500);
```

### Classes Específicas

```typescript
import { 
  ValidationError, 
  AuthenticationError, 
  AuthorizationError, 
  NotFoundError,
  ConflictError,
  FileUploadError,
  DatabaseError 
} from '../src/utils/errors';

// Erro de validação
throw new ValidationError('Campo obrigatório não preenchido', { field: 'email' });

// Erro de autenticação
throw new AuthenticationError('Token inválido');

// Erro de autorização
throw new AuthorizationError('Acesso negado');

// Recurso não encontrado
throw new NotFoundError('User');

// Conflito de dados
throw new ConflictError('Email já está em uso');
```

### Funções Factory

```typescript
import { 
  createValidationError, 
  createRequiredFieldError,
  createDuplicateError,
  createFileError 
} from '../src/utils/errors';

// Campo inválido
throw createValidationError('email', 'invalid@email');

// Campo obrigatório
throw createRequiredFieldError('email');

// Entrada duplicada
throw createDuplicateError('User', 'email', 'user@email.com');

// Erro de arquivo
throw createFileError('size', { maxSize: '5MB', receivedSize: '10MB' });
```

## Respostas Padronizadas

### ResponseHandler

```typescript
import { ResponseHandler } from '../src/utils/apiResponse';

// Resposta de sucesso
ResponseHandler.success(res, data, {
  message: 'Operação realizada com sucesso',
  requestId: req.requestId
});

// Resposta com paginação
ResponseHandler.paginated(res, items, {
  page: 1,
  limit: 10,
  total: 100
}, {
  requestId: req.requestId
});

// Resposta de criação (201)
ResponseHandler.created(res, newResource, 'Recurso criado', req.requestId);

// Resposta de erro
ResponseHandler.error(res, error, req.requestId);

// Respostas específicas
ResponseHandler.notFound(res, 'Usuário não encontrado', req.requestId);
ResponseHandler.unauthorized(res, 'Token inválido', req.requestId);
ResponseHandler.forbidden(res, 'Acesso negado', req.requestId);
```

## Middleware de Tratamento de Erros

### withErrorHandler

Middleware básico que captura erros e gera request IDs:

```typescript
import { withErrorHandler } from '../src/middleware/errorHandler';

async function handler(req: ApiRequest, res: NextApiResponse) {
  // Se qualquer erro for lançado aqui, será capturado automaticamente
  throw new ValidationError('Dados inválidos');
}

export default withErrorHandler(handler);
```

### withMethods

Valida métodos HTTP permitidos:

```typescript
import { withMethods, withErrorHandler } from '../src/middleware/errorHandler';

async function handler(req: ApiRequest, res: NextApiResponse) {
  // Lógica da API
}

export default withMethods(['GET', 'POST'])(withErrorHandler(handler));
```

### withRateLimit

Implementa rate limiting:

```typescript
import { withRateLimit } from '../src/middleware/errorHandler';

const rateLimitMiddleware = withRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por janela
  message: 'Muitas requisições, tente novamente em 15 minutos'
});

export default rateLimitMiddleware(withErrorHandler(handler));
```

### withCors

Configura CORS:

```typescript
import { withCors } from '../src/middleware/errorHandler';

const corsMiddleware = withCors({
  origin: ['https://example.com', 'https://app.example.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
});

export default corsMiddleware(withErrorHandler(handler));
```

### Composição de Middlewares

```typescript
import { compose, withMethods, withRateLimit, withCors, withErrorHandler } from '../src/middleware/errorHandler';

async function handler(req: ApiRequest, res: NextApiResponse) {
  // Lógica da API
}

export default compose(
  withMethods(['GET', 'POST']),
  withRateLimit({ windowMs: 60000, max: 10 }),
  withCors({ origin: '*' }),
  withErrorHandler
)(handler);
```

## Sistema de Logging

### Logging Básico

```typescript
import { logger } from '../src/utils/logger';

// Diferentes níveis de log
logger.debug('Debug message', { requestId: req.requestId });
logger.info('Info message', { userId: user.id });
logger.warn('Warning message', { resource: 'user' });
logger.error('Error message', { error: err.message, stack: err.stack });
```

### Logging Especializado

```typescript
// Requisições de API
logger.apiRequest('POST', '/api/users', { requestId: req.requestId });
logger.apiResponse('POST', '/api/users', 201, 150, { requestId: req.requestId });

// Operações de banco de dados
logger.dbOperation('create', 'users', 100, { requestId: req.requestId });
logger.dbError('create', 'users', 'Validation error', { requestId: req.requestId });

// Operações de arquivo
logger.fileOperation('upload', 'profile.jpg', 1024000, { requestId: req.requestId });
logger.fileError('upload', 'profile.jpg', 'File too large', { requestId: req.requestId });

// Eventos de segurança
logger.securityEvent('Failed login attempt', 'medium', { 
  ip: req.ip, 
  userAgent: req.headers['user-agent'] 
});

// Performance
logger.performance('database query', 2500, { operation: 'find users' });
```

## Exemplo Completo de API Route

```typescript
import type { NextApiResponse } from 'next';
import { ResponseHandler } from '../../src/utils/apiResponse';
import { ValidationError, AuthenticationError } from '../../src/utils/errors';
import { withErrorHandler, withMethods, ApiRequest } from '../../src/middleware/errorHandler';
import { logger } from '../../src/utils/logger';

async function getUsers(req: ApiRequest, res: NextApiResponse) {
  const startTime = Date.now();

  try {
    // Validação
    const { page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    
    if (pageNum < 1) {
      throw new ValidationError('Página deve ser maior que 0');
    }

    // Lógica de busca
    const users = await User.find()
      .skip((pageNum - 1) * 10)
      .limit(10);

    const total = await User.countDocuments();

    logger.dbOperation('find', 'users', Date.now() - startTime, {
      requestId: req.requestId,
      count: users.length
    });

    // Resposta padronizada
    return ResponseHandler.paginated(res, users, {
      page: pageNum,
      limit: 10,
      total
    }, {
      requestId: req.requestId
    });

  } catch (error) {
    logger.dbError('find', 'users', error.message, {
      requestId: req.requestId
    });
    throw error;
  }
}

async function createUser(req: ApiRequest, res: NextApiResponse) {
  // Validação
  if (!req.body.email) {
    throw new ValidationError('Email é obrigatório');
  }

  // Criação
  const user = await User.create(req.body);
  
  logger.info('User created', {
    userId: user._id,
    email: user.email,
    requestId: req.requestId
  });

  return ResponseHandler.created(res, user, 'Usuário criado com sucesso', req.requestId);
}

async function handler(req: ApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      return getUsers(req, res);
    case 'POST':
      return createUser(req, res);
  }
}

export default withMethods(['GET', 'POST'])(withErrorHandler(handler));
```

## Formato das Respostas

### Resposta de Sucesso

```json
{
  "success": true,
  "data": {
    // Dados da resposta
  },
  "message": "Operação realizada com sucesso",
  "metadata": {
    "timestamp": "2024-01-01T10:00:00.000Z",
    "requestId": "uuid-here",
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### Resposta de Erro

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email é obrigatório",
    "statusCode": 400,
    "timestamp": "2024-01-01T10:00:00.000Z",
    "requestId": "uuid-here",
    "details": {
      "field": "email"
    }
  }
}
```

## Benefícios

1. **Consistência**: Todas as APIs seguem o mesmo padrão de resposta
2. **Rastreabilidade**: Cada request tem um ID único para logging
3. **Debugging**: Logs estruturados facilitam a identificação de problemas
4. **Monitoramento**: Métricas de performance e erro automáticas
5. **Segurança**: Sanitização automática de erros em produção
6. **Manutenibilidade**: Código mais limpo e organizad