import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { formatDate, formatDateTime } from '@race/utils';
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorState,
  LoadingState,
  StatusBadge,
} from '@race/ui';

import { useProfile } from '@/hooks/use-profile';

const profileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Valid phone required'),
  department: z.string().min(1, 'Department is required'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'At least 6 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export function ProfileContent() {
  const { data: profile, isLoading, isError, refetch, update, password, avatar } = useProfile();
  const fileRef = useRef<HTMLInputElement>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: profile
      ? {
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          department: profile.department,
        }
      : undefined,
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  if (isLoading) return <LoadingState message="Loading profile..." />;
  if (isError || !profile) {
    return <ErrorState message="Failed to load profile" onRetry={() => void refetch()} />;
  }

  const onProfileSubmit = profileForm.handleSubmit((values) => {
    update.mutate(values);
  });

  const onPasswordSubmit = passwordForm.handleSubmit((values) => {
    setPasswordError('');
    setPasswordSuccess(false);
    password.mutate(values, {
      onSuccess: () => {
        setPasswordSuccess(true);
        passwordForm.reset();
      },
      onError: (err) => setPasswordError(err.message),
    });
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Image</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <Avatar
            fallback={profile.name.charAt(0)}
            alt={profile.name}
            src={profile.avatarUrl}
            className="h-20 w-20 text-2xl"
          />
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) avatar.mutate(file);
              }}
            />
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => fileRef.current?.click()}
              disabled={avatar.isPending}
            >
              {avatar.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              Upload Photo
            </Button>
            <p className="mt-2 text-xs text-[#9CA3AF]">JPG, PNG. Max 2MB.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onProfileSubmit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#1A1A2E]">Full Name</label>
              <input
                className="flex h-10 w-full rounded-lg border border-[#EEEEEE] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]"
                {...profileForm.register('name')}
              />
              {profileForm.formState.errors.name ? (
                <p className="mt-1 text-xs text-[#DC2626]">{profileForm.formState.errors.name.message}</p>
              ) : null}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#1A1A2E]">Email</label>
              <input
                type="email"
                className="flex h-10 w-full rounded-lg border border-[#EEEEEE] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]"
                {...profileForm.register('email')}
              />
              {profileForm.formState.errors.email ? (
                <p className="mt-1 text-xs text-[#DC2626]">{profileForm.formState.errors.email.message}</p>
              ) : null}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#1A1A2E]">Phone</label>
              <input
                className="flex h-10 w-full rounded-lg border border-[#EEEEEE] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]"
                {...profileForm.register('phone')}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#1A1A2E]">Department</label>
              <input
                className="flex h-10 w-full rounded-lg border border-[#EEEEEE] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]"
                {...profileForm.register('department')}
              />
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm text-[#9CA3AF]">
                Role: {profile.role.replace(/_/g, ' ')} · Joined {formatDate(profile.joinedAt)}
              </p>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={update.isPending}>
                {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password Change</CardTitle>
        </CardHeader>
        <CardContent>
          {passwordError ? (
            <div className="mb-4 rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#DC2626]">
              {passwordError}
            </div>
          ) : null}
          {passwordSuccess ? (
            <div className="mb-4 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm text-[#16A34A]">
              Password updated successfully.
            </div>
          ) : null}
          <form onSubmit={onPasswordSubmit} className="grid max-w-md gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Current Password</label>
              <input
                type="password"
                className="flex h-10 w-full rounded-lg border border-[#EEEEEE] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]"
                {...passwordForm.register('currentPassword')}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">New Password</label>
              <input
                type="password"
                className="flex h-10 w-full rounded-lg border border-[#EEEEEE] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]"
                {...passwordForm.register('newPassword')}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Confirm Password</label>
              <input
                type="password"
                className="flex h-10 w-full rounded-lg border border-[#EEEEEE] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A623]"
                {...passwordForm.register('confirmPassword')}
              />
              {passwordForm.formState.errors.confirmPassword ? (
                <p className="mt-1 text-xs text-[#DC2626]">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              ) : null}
            </div>
            <Button type="submit" disabled={password.isPending}>
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Login Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-[#EEEEEE]">
            {profile.loginActivity.map((activity) => (
              <li key={activity.id} className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-[#1A1A2E]">{activity.device}</p>
                  <p className="text-sm text-[#555555]">
                    {activity.location} · {activity.ipAddress}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={activity.status} />
                  <span className="text-sm text-[#9CA3AF]">{formatDateTime(activity.timestamp)}</span>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
