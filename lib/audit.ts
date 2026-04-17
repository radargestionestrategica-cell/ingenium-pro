import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import jwt from 'jsonwebtoken';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (credentials?.email && credentials?.password) {
          return { id: '1', email: credentials.email, name: 'Usuario INGENIUM' };
        }
        return null;
      }
    })
  ],
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET || 'ingenium-secret-2026',
};

export function signJWT(payload: object): string {
  return jwt.sign(payload, process.env.NEXTAUTH_SECRET || 'ingenium-secret-2026', { expiresIn: '7d' });
}

export function verifyJWT(token: string): object | null {
  try {
    return jwt.verify(token, process.env.NEXTAUTH_SECRET || 'ingenium-secret-2026') as object;
  } catch {
    return null;
  }
}