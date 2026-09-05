import { PageHeader } from '@/components/layout/page-header';
import { ProfileContent } from '@/components/profile/profile-content';

export function ProfilePage() {
  return (
    <>
      <PageHeader
        title="My Profile"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Profile' }]}
      />
      <ProfileContent />
    </>
  );
}
