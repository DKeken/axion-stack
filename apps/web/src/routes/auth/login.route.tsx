import { useEffect, useState } from 'react';

import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Form } from '@heroui/form';
import { Input } from '@heroui/input';
import { Link as HeroUILink } from '@heroui/link';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi';

import DefaultLayout from '~/components/layouts/default';
import { useWindowSize } from '~/hooks/use-window-size';
import { selectIsAuthenticated, useAuthStore } from '~/stores/auth-store';

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const { width } = useWindowSize();
  const isMobile = (width ?? 1024) < 640;

  useEffect(() => {
    if (isAuthenticated) {
      void router.navigate({ to: '/' });
    }
  }, [isAuthenticated, router]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData(form);
      const email = String(formData.get('email') ?? '');
      const password = String(formData.get('password') ?? '');
      await login({ email, password });
      await router.navigate({ to: '/' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DefaultLayout>
      <div className='mx-auto w-full max-w-md px-3 sm:px-0 py-10 sm:py-16'>
        <Card className='bg-content1/70 supports-[backdrop-filter]:bg-content1/50 backdrop-blur border border-divider/60'>
          <CardHeader className='flex flex-col items-start gap-1 px-5 py-4'>
            <h1 className='text-xl sm:text-2xl font-semibold'>Вход</h1>
            <p className='text-sm text-foreground-600'>Добро пожаловать обратно</p>
          </CardHeader>
          <CardBody className='px-5 pb-5'>
            <Form
              className='flex flex-col gap-4'
              onSubmit={(e) => {
                void onSubmit(e);
              }}
              validationBehavior='aria'
            >
              <Input
                name='email'
                type='email'
                label='Email'
                autoComplete='email'
                autoFocus
                startContent={<FiMail size={16} className='text-foreground-500' />}
                isRequired
                pattern='^.+@.+\..+$'
                errorMessage='Введите корректный email'
                size={isMobile ? 'sm' : 'md'}
                variant='bordered'
                radius='sm'
              />
              <Input
                name='password'
                type={isPasswordVisible ? 'text' : 'password'}
                label='Пароль'
                autoComplete='current-password'
                startContent={<FiLock size={16} className='text-foreground-500' />}
                isRequired
                minLength={8}
                errorMessage='Минимум 8 символов'
                endContent={
                  <button
                    type='button'
                    aria-label={isPasswordVisible ? 'Скрыть пароль' : 'Показать пароль'}
                    title={isPasswordVisible ? 'Скрыть пароль' : 'Показать пароль'}
                    onClick={() => setIsPasswordVisible((v) => !v)}
                    className='focus:outline-none text-foreground-500'
                  >
                    {isPasswordVisible ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                }
                size={isMobile ? 'sm' : 'md'}
                variant='bordered'
                radius='sm'
              />
              {error ? (
                <p role='alert' aria-live='polite' className='text-danger text-sm'>
                  {error}
                </p>
              ) : null}
              <Button
                color='primary'
                type='submit'
                isLoading={isSubmitting}
                isDisabled={isSubmitting}
                size={isMobile ? 'sm' : 'md'}
                className='mt-2'
              >
                Войти
              </Button>
              <div className='text-sm text-foreground-600'>
                Нет аккаунта?{' '}
                <HeroUILink href='/auth/register' underline='hover'>
                  Зарегистрироваться
                </HeroUILink>
              </div>
            </Form>
          </CardBody>
        </Card>
      </div>
    </DefaultLayout>
  );
}
