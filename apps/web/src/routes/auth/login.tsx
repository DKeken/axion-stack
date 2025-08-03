import { createFileRoute } from '@tanstack/react-router';

import { PublicOnlyGuard } from '~/components/auth/auth-guard';
import { LoginForm } from '~/components/auth/login-form';

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
});

function LoginPage() {
  return (
    <PublicOnlyGuard>
      <div className='min-h-screen flex items-center justify-center bg-background p-4'>
        <div className='w-full max-w-md'>
          <LoginForm />
        </div>
      </div>
    </PublicOnlyGuard>
  );
}
