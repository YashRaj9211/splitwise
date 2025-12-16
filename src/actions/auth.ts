'use server';

import prisma from '@/db';
import bcrypt from 'bcryptjs';

import { signIn, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';

import { generateAvatar } from '@/lib/avatar';

export type AuthState = {
  message?: string;
  errors?: any;
  success?: boolean;
};

async function signup(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const username = formData.get('username') as string;
  try {
    const avatarUrl = await generateAvatar(username || email);
    const hassedPassword = bcrypt.hashSync(password, 4);
    await prisma.user.create({
      data: { email, name, password: hassedPassword, username, avatarUrl }
    });
    return { success: true, message: 'User registered successfully' };
  } catch (error: any) {
    console.error(error);
    // basic error handling for duplicates
    if (error.code === 'P2002') {
      return { success: false, message: 'User already exists with this email or username' };
    }
    return { success: false, message: 'Something went wrong during registration' };
  }
}

async function singinFn(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  try {
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false
    });

    if (res?.error) {
      return { success: false, message: 'Invalid credentials' }; // signIn usually returns concise errors or we can map them
    }

    // If successful, we need to redirect manually since we disabled it above
    // However, in server actions, redirect throws an error which is caught by Next.js to handle the redirect.
    // We should NOT catch it in our try/catch block if we want it to work, OR we return success and let the client redirect.
    // But since we want to redirect from server side:
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    // Auth.js throws a specific error for credentials sign in failure sometimes
    const err = error as any;
    if (err.type === 'CredentialsSignin') {
      return { success: false, message: 'Invalid credentials.' };
    }

    console.error(error);
    return { success: false, message: 'Something went wrong' };
  }

  redirect('/');
}

async function singoutFn() {
  await signOut();
  console.log('Signing out...');
  redirect('/auth/login');
}

export { singinFn, singoutFn, signup };
