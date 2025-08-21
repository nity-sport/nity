import crypto from 'crypto';

export const generateAffiliateCode = (length: number = 8): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
};

export const generateUniqueAffiliateCode = async (
  checkFunction: (code: string) => Promise<boolean>
): Promise<string> => {
  let code: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    code = generateAffiliateCode();
    isUnique = await checkFunction(code);
    attempts++;
  }

  if (!isUnique) {
    // Fallback to timestamp-based code if random generation fails
    code = `SC${Date.now().toString(36).toUpperCase()}`;
  }

  return code!;
};
