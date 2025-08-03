import { createFileRoute } from '@tanstack/react-router';

import { Layout } from '~/components/layout/layout';
import { Spinner } from '~/components/ui/shadcn-io/spinner';
import { useAuth } from '~/stores/auth-store';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const { user, isAuthenticated, isLoading, isInitialized } = useAuth();

  // Show loading spinner during initial auth check
  if (!isInitialized || isLoading) {
    return (
      <Layout>
        <div className='container mx-auto p-6'>
          <div className='flex items-center justify-center h-full'>
            <Spinner />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className='container mx-auto p-6'>
        <div className='space-y-6'>
          <div className='text-center'>
            <h1 className='text-4xl font-bold mb-2'>Добро пожаловать!</h1>
            <p className='text-muted-foreground text-lg'>
              {isAuthenticated
                ? `Привет, ${user?.name ?? user?.email ?? 'Пользователь'}!`
                : 'Пожалуйста, войдите в систему для полного доступа'}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
