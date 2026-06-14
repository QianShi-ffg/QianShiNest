import {
  constants,
  generateKeyPairSync,
  privateDecrypt,
  publicEncrypt,
} from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { isPasswordHash, verifyPassword as verifyHashPassword } from './password-hash';

const PREFIX = 'rsa:';
const keyDir = join(process.cwd(), 'private/keys');
const privateKeyPath = join(keyDir, 'password-private.pem');
const publicKeyPath = join(keyDir, 'password-public.pem');

const ensureKeyPair = () => {
  if (existsSync(privateKeyPath) && existsSync(publicKeyPath)) return;

  mkdirSync(keyDir, { recursive: true });
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  writeFileSync(privateKeyPath, privateKey);
  writeFileSync(publicKeyPath, publicKey);
};

const getPrivateKey = () => {
  ensureKeyPair();
  return readFileSync(privateKeyPath, 'utf8');
};

export const getPasswordPublicKey = () => {
  ensureKeyPair();
  return readFileSync(publicKeyPath, 'utf8');
};

export const isEncryptedPassword = (value?: string | null) => {
  return Boolean(value && value.startsWith(PREFIX));
};

export const encryptPassword = (password: string) => {
  const encrypted = publicEncrypt(
    {
      key: getPasswordPublicKey(),
      padding: constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    Buffer.from(password, 'utf8'),
  );
  return `${PREFIX}${encrypted.toString('base64')}`;
};

export const decryptPassword = (value: string) => {
  if (!isEncryptedPassword(value)) return value;

  const decrypted = privateDecrypt(
    {
      key: getPrivateKey(),
      padding: constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    Buffer.from(value.slice(PREFIX.length), 'base64'),
  );
  return decrypted.toString('utf8');
};

export const normalizeIncomingPassword = (value?: string | null) => {
  const password = value?.trim() || '';
  if (!password) return '';
  return decryptPassword(password);
};

export const encryptPasswordForStorage = (value?: string | null) => {
  const password = normalizeIncomingPassword(value);
  return password ? encryptPassword(password) : '';
};

export const verifyStoredPassword = async (
  inputPassword: string,
  storedPassword?: string | null,
) => {
  const password = normalizeIncomingPassword(inputPassword);
  if (!password || !storedPassword) return false;

  if (isEncryptedPassword(storedPassword)) {
    return decryptPassword(storedPassword) === password;
  }

  if (isPasswordHash(storedPassword)) {
    return verifyHashPassword(password, storedPassword);
  }

  return storedPassword === password;
};

export const decryptStoredPassword = (storedPassword?: string | null) => {
  if (!storedPassword) return '';
  if (isEncryptedPassword(storedPassword)) return decryptPassword(storedPassword);
  if (isPasswordHash(storedPassword)) return '';
  return storedPassword;
};
