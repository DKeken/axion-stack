import { LogoutButton } from '~/components/auth/logout-button';
import { UserInfo } from '~/components/auth/user-info';
import { AuthGuard } from '~/components/auth-guard';

export default function HomePage() {
  return (
    <AuthGuard>
      <div className='min-h-screen bg-gradient-to-br from-background to-muted'>
        <header className='flex justify-between items-center p-6 border-b bg-card/80 backdrop-blur-sm'>
          <h2 className='text-2xl font-bold'>axion</h2>
          <LogoutButton />
        </header>

        <main className='container mx-auto p-8'>
          <div className='text-center space-y-6'>
            <h1 className='text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent'>
              Добро пожаловать в axion!
            </h1>
            <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
              Вы успешно авторизованы в системе. Теперь у вас есть доступ ко всем функциям
              платформы.
            </p>

            <div className='space-y-8 mt-12'>
              <UserInfo />

              <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto'>
                <div className='p-6 rounded-lg bg-card border shadow-sm'>
                  <h3 className='text-lg font-semibold mb-2'>🚀 Быстрый старт</h3>
                  <p className='text-sm text-muted-foreground'>
                    Изучите основные возможности платформы и начните работу
                  </p>
                </div>

                <div className='p-6 rounded-lg bg-card border shadow-sm'>
                  <h3 className='text-lg font-semibold mb-2'>📊 Аналитика</h3>
                  <p className='text-sm text-muted-foreground'>
                    Просматривайте статистику и отчеты по вашим проектам
                  </p>
                </div>

                <div className='p-6 rounded-lg bg-card border shadow-sm'>
                  <h3 className='text-lg font-semibold mb-2'>⚙️ Настройки</h3>
                  <p className='text-sm text-muted-foreground'>
                    Настройте профиль и параметры работы системы
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
