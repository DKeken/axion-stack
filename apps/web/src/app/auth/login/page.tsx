import type { Metadata } from 'next';

import { LoginForm } from '~/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Вход - axion',
  description: 'Войдите в ваш аккаунт axion',
};

export default function LoginPage() {
  return <LoginForm />;
}
