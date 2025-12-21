'use client';

import { singinFn, AuthState } from '@/actions/auth';
import Link from 'next/link';
import { useActionState } from 'react';

const initialState: AuthState = {
  message: '',
  errors: null,
  success: false,
};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(singinFn, initialState);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-primary-light p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full opacity-20 bg-[radial-gradient(circle_at_center,var(--color-accent-pink)_0%,transparent_70%)] blur-3xl" />
        <div className="absolute top-0 right-0 w-96 h-96 opacity-20 bg-[radial-gradient(circle_at_center,var(--color-accent-blue)_0%,transparent_70%)] blur-3xl" />
      </div>

      <div className="relative w-full max-w-md card-edged p-8 sm:p-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl text-header mb-2">Welcome Back</h1>
          <p className="text-secondary-text text-sm">Sign in to continue managing your expenses.</p>
        </div>

        <form className="space-y-5" action={formAction}>
           {state.message && !state.success && (
            <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
              {state.message}
            </div>
           )}

          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold text-primary uppercase tracking-wider mb-1.5 ml-1"
            >
              Email Address
            </label>
            <div className="relative group">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                className="input-edged"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex justify-between items-center mb-1.5 ml-1 pr-1">
              <label htmlFor="password" className="block text-xs font-bold text-primary uppercase tracking-wider">
                Password
              </label>
              <Link href="#" className="text-xs text-secondary-text hover:text-primary transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative group">
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="input-edged"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button type="submit" disabled={isPending} className="w-full btn-primary disabled:opacity-70 disabled:cursor-not-allowed">
              {isPending ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="my-8 flex items-center">
          <div className="flex-1 border-t-2 border-primary/10"></div>
          <span className="px-4 text-xs text-secondary-text font-bold uppercase">Or continue with</span>
          <div className="flex-1 border-t-2 border-primary/10"></div>
        </div>

        {/* Social Logins */}
        <div className="grid grid-cols-2 gap-4">
          <button className="btn-outlined justify-center text-sm">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
            </svg>
            <span>Google</span>
          </button>
          <button className="btn-outlined justify-center text-sm">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
            </svg>
            <span>Facebook</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-secondary-text text-sm">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-primary font-bold hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

