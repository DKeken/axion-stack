import { createFileRoute } from '@tanstack/react-router';

import { AuthGuard } from '~/components/auth/auth-guard';
import { Layout } from '~/components/layout/layout';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { useAuth } from '~/stores/auth-store';

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AuthGuard>
      <Layout>
        <SettingsContent />
      </Layout>
    </AuthGuard>
  );
}

function SettingsContent() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className='max-w-2xl mx-auto space-y-6'>
      <h1 className='text-3xl font-bold'>Настройки</h1>

      <Card>
        <CardHeader>
          <CardTitle>Общие настройки</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-sm font-medium'>Уведомления</h3>
                <p className='text-sm text-muted-foreground'>
                  Получать уведомления о важных событиях
                </p>
              </div>
              <Badge variant='secondary'>Включено</Badge>
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-sm font-medium'>Тема оформления</h3>
                <p className='text-sm text-muted-foreground'>Выберите светлую или темную тему</p>
              </div>
              <Badge variant='outline'>Системная</Badge>
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-sm font-medium'>Язык интерфейса</h3>
                <p className='text-sm text-muted-foreground'>
                  Выберите язык отображения интерфейса
                </p>
              </div>
              <Badge variant='outline'>Русский</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Безопасность</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-sm font-medium'>Двухфакторная аутентификация</h3>
                <p className='text-sm text-muted-foreground'>
                  Дополнительная защита вашего аккаунта
                </p>
              </div>
              <Button variant='outline' size='sm'>
                Настроить
              </Button>
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-sm font-medium'>Активные сессии</h3>
                <p className='text-sm text-muted-foreground'>
                  Управляйте устройствами, на которых выполнен вход
                </p>
              </div>
              <Button variant='outline' size='sm'>
                Управлять
              </Button>
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-sm font-medium'>Изменить пароль</h3>
                <p className='text-sm text-muted-foreground'>
                  Обновите пароль для повышения безопасности
                </p>
              </div>
              <Button variant='outline' size='sm'>
                Изменить
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Учетная запись</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-sm font-medium'>Экспорт данных</h3>
                <p className='text-sm text-muted-foreground'>Скачайте копию ваших данных</p>
              </div>
              <Button variant='outline' size='sm'>
                Экспорт
              </Button>
            </div>

            <div className='flex items-center justify-between border-t pt-4'>
              <div>
                <h3 className='text-sm font-medium text-destructive'>Удалить аккаунт</h3>
                <p className='text-sm text-muted-foreground'>
                  Навсегда удалить ваш аккаунт и все данные
                </p>
              </div>
              <Button variant='destructive' size='sm'>
                Удалить
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
