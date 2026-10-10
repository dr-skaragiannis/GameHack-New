import { scrypt } from "@noble/hashes/scrypt";
import { bytesToHex, hexToBytes, randomBytes, utf8ToBytes } from "@noble/hashes/utils";

const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1, dkLen: 64 } as const;
const HASH_PATTERN = /^scrypt\$([0-9a-f]{32})\$([0-9a-f]{128})$/i;

export function isScryptHash(value: string): boolean {
  return HASH_PATTERN.test(value);
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const digest = scrypt(utf8ToBytes(password), salt, SCRYPT_OPTIONS);
  return `scrypt$${bytesToHex(salt)}$${bytesToHex(digest)}`;
}

export function verifyPassword(password: string, savedHash: string): boolean {
  const match = HASH_PATTERN.exec(savedHash || "");
  if (!match || !password) return false;
  const salt = hexToBytes(match[1]);
  const expected = hexToBytes(match[2]);
  const actual = scrypt(utf8ToBytes(password), salt, SCRYPT_OPTIONS);
  if (actual.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < actual.length; index += 1) difference |= actual[index] ^ expected[index];
  return difference === 0;
}
