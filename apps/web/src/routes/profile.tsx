import { createFileRoute } from '@tanstack/react-router';

import { AuthGuard } from '~/components/auth/auth-guard';
import { Layout } from '~/components/layout/layout';
import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { useAuth } from '~/stores/auth-store';

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <AuthGuard>
      <Layout>
        <ProfileContent />
      </Layout>
    </AuthGuard>
  );
}

function ProfileContent() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className='max-w-2xl mx-auto space-y-6'>
      <h1 className='text-3xl font-bold'>Профиль пользователя</h1>

      <Card>
        <CardHeader>
          <CardTitle>Личная информация</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label htmlFor='profile-name' className='text-sm font-medium text-muted-foreground'>
                Имя
              </label>
              <p id='profile-name' className='text-lg'>
                {user.name ?? 'Не указано'}
              </p>
            </div>

            <div>
              <label htmlFor='profile-email' className='text-sm font-medium text-muted-foreground'>
                Email
              </label>
              <p id='profile-email' className='text-lg'>
                {user.email}
              </p>
            </div>

            <div>
              <label
                htmlFor='profile-created-at'
                className='text-sm font-medium text-muted-foreground'
              >
                Дата регистрации
              </label>
              <p id='profile-created-at' className='text-lg'>
                {new Date(user.createdAt).toLocaleDateString('ru-RU')}
              </p>
            </div>

            <div>
              <span className='text-sm font-medium text-muted-foreground' id='profile-status-label'>
                Статус
              </span>
              <div className='flex items-center space-x-2' aria-labelledby='profile-status-label'>
                <Badge variant='secondary'>Активен</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
