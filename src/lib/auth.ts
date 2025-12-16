import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/db';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: {
          type: 'email',
          label: 'Email',
          placeholder: 'johndoe@gmail.com'
        },
        password: {
          type: 'password',
          label: 'Password',
          placeholder: '*****'
        }
      },
      authorize: async (credentials, request): Promise<any> => {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials?.email as string;
        const password = credentials?.password as string;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error('User does not exist');

        const isPasswordCorrect = bcrypt.compareSync(password, user.password);
        if (!isPasswordCorrect) throw new Error('Invalid password');
        return {
          id: user.id,
          email: user.email,
          name: user.username,
          avatarUrl: user.avatarUrl
        };
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login'
  }
});
