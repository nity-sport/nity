import { logger } from '../../src/utils/logger';

// Mock console methods
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(),
  info: jest.spyOn(console, 'info').mockImplementation(),
  warn: jest.spyOn(console, 'warn').mockImplementation(),
  error: jest.spyOn(console, 'error').mockImplementation(),
};

describe('Logger', () => {
  beforeEach(() => {
    // Clear all mock calls
    Object.values(consoleSpy).forEach(spy => spy.mockClear());
  });

  afterAll(() => {
    // Restore original console methods
    Object.values(consoleSpy).forEach(spy => spy.mockRestore());
  });

  describe('in development mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should call debug method without error', () => {
      expect(() => logger.debug('debug message', { data: 'test' })).not.toThrow();
    });

    it('should call info method without error', () => {
      expect(() => logger.info('info message')).not.toThrow();
    });

    it('should call warn method without error', () => {
      expect(() => logger.warn('warn message')).not.toThrow();
    });

    it('should log error messages', () => {
      logger.error('error message');
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe('in production mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('should call debug method without error in production', () => {
      expect(() => logger.debug('debug message')).not.toThrow();
    });

    it('should log error messages in production', () => {
      logger.error('error message');
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });
});