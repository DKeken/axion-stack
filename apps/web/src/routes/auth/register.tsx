import { createFileRoute } from '@tanstack/react-router';

import { PublicOnlyGuard } from '~/components/auth/auth-guard';
import { RegisterForm } from '~/components/auth/register-form';

export const Route = createFileRoute('/auth/register')({
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <PublicOnlyGuard>
      <div className='min-h-screen flex items-center justify-center bg-background p-4'>
        <div className='w-full max-w-md'>
          <RegisterForm />
        </div>
      </div>
    </PublicOnlyGuard>
  );
}
