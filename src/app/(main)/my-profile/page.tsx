import { ProfileForm } from '@/features/users/components/profile-form';
import { getCurrentUserProfileAction } from '@/features/users/actions';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function MyProfilePage() {
  const result = await getCurrentUserProfileAction();

  if (!result.success || !result.data) {
    redirect('/login');
  }

  const profile = result.data;

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Profil Saya</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={profile} />
        </CardContent>
      </Card>
    </div>
  );
}
