import * as bcrypt from 'bcryptjs';

export const isPasswordHash = (value?: string | null) => {
  return Boolean(value && /^\$2[aby]\$\d{2}\$/.test(value));
};

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 12);
};

export const verifyPassword = async (password: string, stored?: string | null) => {
  if (!stored) return false;

  if (!isPasswordHash(stored)) {
    return stored === password;
  }

  return bcrypt.compare(password, stored);
};
