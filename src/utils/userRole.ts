import { UserRole } from '../types/auth';

export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    [UserRole.SUPERUSER]: 'Super Usuário',
    [UserRole.MARKETING]: 'Marketing',
    [UserRole.OWNER]: 'Proprietário',
    [UserRole.SCOUT]: 'Scout',
    [UserRole.USER]: 'Usuário',
    [UserRole.ATHLETE]: 'Atleta',
  };
  return roleNames[role];
};

export const getStatusDisplayName = (status: string): string => {
  const statusNames: Record<string, string> = {
    public: 'Público',
    private: 'Privado',
    draft: 'Rascunho',
  };
  return statusNames[status] || status;
};
