import type { Metadata } from 'next';

import { RegisterForm } from '~/components/auth/register-form';

export const metadata: Metadata = {
  title: 'Регистрация - axion',
  description: 'Создайте новый аккаунт axion',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
