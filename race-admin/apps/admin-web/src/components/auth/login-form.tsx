import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Lock, Shield, User } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@race/ui';

import { useLogin } from '@/hooks/use-login';
import { loginFormSchema, type LoginFormValues } from '@/types/auth';

const inputClass =
  'flex h-12 w-full rounded-lg border border-[#D1D5DB] bg-white pl-10 pr-4 text-sm text-[#1A1A2E] placeholder:text-[#9CA3AF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]/50 disabled:opacity-60';

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
      identifier: '',
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
    <div className="w-full">
      <div className="login-animate-fade-up login-delay-3 mb-8 text-center">
        <h1 className="text-[1.65rem] font-bold leading-tight text-[#1A1A2E]">
          Welcome Back! <span aria-hidden>👋</span>
        </h1>
        <p className="mt-2 text-sm text-[#6B7280]">Sign in to continue to RACE Admin Panel</p>
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

      <form onSubmit={handleSubmit(onSubmit)} className="login-animate-fade-up login-delay-4 space-y-5" noValidate>
        <div>
          <label htmlFor="identifier" className="mb-2 block text-sm font-bold text-[#1A1A2E]">
            Email or Mobile Number
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#9CA3AF]" />
            <input
              id="identifier"
              type="text"
              autoComplete="username"
              placeholder="Enter email or mobile number"
              disabled={isLoading}
              className={inputClass}
              {...register('identifier')}
            />
          </div>
          {errors.identifier ? (
            <p className="mt-1.5 text-xs text-[#DC2626]">{errors.identifier.message}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-bold text-[#1A1A2E]">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#9CA3AF]" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              disabled={isLoading}
              className={`${inputClass} pr-11`}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
            </button>
          </div>
          {errors.password ? (
            <p className="mt-1.5 text-xs text-[#DC2626]">{errors.password.message}</p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-4 pt-1">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-[#4B5563]">
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
          className="h-12 w-full rounded-lg bg-[#F5A623] text-base font-bold text-white hover:bg-[#e09515]"
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

      <div className="login-animate-fade-in login-delay-4 mt-6 flex items-center justify-center gap-2 text-center text-xs text-[#9CA3AF]">
        <Shield className="h-3.5 w-3.5 shrink-0" />
        <span>Authorized access only. Activity may be monitored.</span>
      </div>
    </div>
  );
}
