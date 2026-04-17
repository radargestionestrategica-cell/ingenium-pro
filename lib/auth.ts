import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
import jwt from 'jsonwebtoken';

export function signJWT(payload: any): string {
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
    expiresIn: '7d',
  });
}