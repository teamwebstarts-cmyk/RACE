import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Lock, Mail, Shield } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@race/ui';

import { useLogin } from '@/hooks/use-login';
import { loginFormSchema, type LoginFormValues } from '@/types/auth';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.reset();
    loginMutation.mutate(values);
  };

  const isLoading = loginMutation.isPending;
  const isSuccess = loginMutation.isSuccess;
  const apiError = loginMutation.error?.message;

  return (
    <div className="flex w-full max-w-md flex-col">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[#1A1A2E]">
          Welcome Back! <span aria-hidden>👋</span>
        </h1>
        <p className="mt-2 text-sm text-[#555555]">Sign in to continue to RACE Admin Panel</p>
      </div>

      {apiError ? (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#DC2626]"
        >
          {apiError}
        </div>
      ) : null}

      {isSuccess ? (
        <div
          role="status"
          className="mb-4 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm text-[#16A34A]"
        >
          Login successful! Redirecting to dashboard...
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-[#1A1A2E]">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              disabled={isLoading}
              className="flex h-12 w-full rounded-xl border border-[#E5E7EB] bg-white pl-10 pr-4 text-sm text-[#1A1A2E] placeholder:text-[#9CA3AF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623] disabled:opacity-60"
              {...register('email')}
            />
          </div>
          {errors.email ? (
            <p className="mt-1.5 text-xs text-[#DC2626]">{errors.email.message}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-[#1A1A2E]">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              disabled={isLoading}
              className="flex h-12 w-full rounded-xl border border-[#E5E7EB] bg-white pl-10 pr-11 text-sm text-[#1A1A2E] placeholder:text-[#9CA3AF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623] disabled:opacity-60"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#555555]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password ? (
            <p className="mt-1.5 text-xs text-[#DC2626]">{errors.password.message}</p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-[#555555]">
            <input
              type="checkbox"
              disabled={isLoading}
              className="h-4 w-4 rounded border-[#D1D5DB] text-[#F5A623] focus:ring-[#F5A623]"
              {...register('rememberMe')}
            />
            Remember me
          </label>
          <a
            href="#forgot-password"
            className="text-sm font-medium text-[#F5A623] hover:text-[#D97706] hover:underline"
            onClick={(e) => e.preventDefault()}
          >
            Forgot Password?
          </a>
        </div>

        <Button
          type="submit"
          disabled={isLoading || isSuccess}
          className="h-12 w-full rounded-xl text-base font-semibold"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Login'
          )}
        </Button>
      </form>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#9CA3AF]">
        <Shield className="h-3.5 w-3.5 shrink-0" />
        <span>Authorized access only. Activity may be monitored.</span>
      </div>
    </div>
  );
}
