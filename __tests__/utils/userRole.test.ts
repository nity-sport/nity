import { getRoleDisplayName, getStatusDisplayName } from '../../src/utils/userRole';
import { UserRole } from '../../src/types/auth';

describe('userRole utils', () => {
  describe('getRoleDisplayName', () => {
    it('should return correct display names for all user roles', () => {
      expect(getRoleDisplayName(UserRole.SUPERUSER)).toBe('Super Usuário');
      expect(getRoleDisplayName(UserRole.MARKETING)).toBe('Marketing');
      expect(getRoleDisplayName(UserRole.OWNER)).toBe('Proprietário');
      expect(getRoleDisplayName(UserRole.SCOUT)).toBe('Scout');
      expect(getRoleDisplayName(UserRole.USER)).toBe('Usuário');
      expect(getRoleDisplayName(UserRole.ATHLETE)).toBe('Atleta');
    });
  });

  describe('getStatusDisplayName', () => {
    it('should return correct display names for known statuses', () => {
      expect(getStatusDisplayName('public')).toBe('Público');
      expect(getStatusDisplayName('private')).toBe('Privado');
      expect(getStatusDisplayName('draft')).toBe('Rascunho');
    });

    it('should return original status for unknown statuses', () => {
      expect(getStatusDisplayName('unknown')).toBe('unknown');
      expect(getStatusDisplayName('custom')).toBe('custom');
    });
  });
});