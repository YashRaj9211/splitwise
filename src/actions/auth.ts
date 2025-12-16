'use server';

import prisma from '@/db';
import bcrypt from 'bcryptjs';

import { signIn, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';

import { generateAvatar } from '@/lib/avatar';

async function signup(formData: FormData): Promise<any> {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const username = formData.get('username') as string;
  try {
    const avatarUrl = await generateAvatar(username || email);
    const hassedPassword = bcrypt.hashSync(password, 4);
    const user = await prisma.user.create({
      data: { email, name, password: hassedPassword, username, avatarUrl }
    });
    return { message: 'User registered successfully' };
  } catch (error) {
    console.log(error);
  }
}

async function singinFn(formData: FormData): Promise<any> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  try {
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false
    });

    if (res?.error) return { message: res.error, redirect: false };
  } catch (error) {
    console.log(error);
    return { message: 'Something went wrong', redirect: false };
  }

  redirect('/');
}

async function singoutFn() {
  await signOut();
  console.log('Signing out...');
  redirect('/auth/login');
}

export { singinFn, singoutFn, signup };
