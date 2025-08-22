import { useEffect, useState } from 'react';

import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Form } from '@heroui/form';
import { Input } from '@heroui/input';
import { Link as HeroUILink } from '@heroui/link';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { FiEye, FiEyeOff, FiLock, FiMail, FiUser } from 'react-icons/fi';

import DefaultLayout from '~/components/layouts/default';
import { useWindowSize } from '~/hooks/use-window-size';
import { selectIsAuthenticated, useAuthStore } from '~/stores/auth-store';

export const Route = createFileRoute('/auth/register')({
  component: RegisterPage,
});

function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const { width } = useWindowSize();
  const isMobile = (width ?? 1024) < 640;

  const passwordsMismatch = confirmPassword.length > 0 && confirmPassword !== password;

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
    if (passwordsMismatch) {
      setError('Пароли не совпадают');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const formData = new FormData(form);
      const email = String(formData.get('email') ?? '');
      const passwordValue = String(formData.get('password') ?? '');
      const name = String(formData.get('name') ?? '');
      await register({
        email,
        password: passwordValue,
        ...(name.trim() && { name: name.trim() }),
      });
      await router.navigate({ to: '/' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DefaultLayout>
      <div className='mx-auto w-full max-w-md px-3 sm:px-0 py-10 sm:py-16'>
        <Card className='bg-content1/70 supports-[backdrop-filter]:bg-content1/50 backdrop-blur border border-divider/60'>
          <CardHeader className='flex flex-col items-start gap-1 px-5 py-4'>
            <h1 className='text-xl sm:text-2xl font-semibold'>Регистрация</h1>
            <p className='text-sm text-foreground-600'>Создайте аккаунт, чтобы продолжить</p>
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
                name='name'
                type='text'
                label='Имя (необязательно)'
                autoComplete='name'
                startContent={<FiUser size={16} className='text-foreground-500' />}
                size={isMobile ? 'sm' : 'md'}
                variant='bordered'
                radius='sm'
              />
              <Input
                name='email'
                type='email'
                label='Email'
                autoComplete='email'
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
                autoComplete='new-password'
                startContent={<FiLock size={16} className='text-foreground-500' />}
                isRequired
                minLength={8}
                errorMessage='Минимум 8 символов'
                value={password}
                onValueChange={setPassword}
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
              <Input
                name='confirmPassword'
                type={isConfirmPasswordVisible ? 'text' : 'password'}
                label='Подтвердите пароль'
                autoComplete='new-password'
                startContent={<FiLock size={16} className='text-foreground-500' />}
                isRequired
                value={confirmPassword}
                onValueChange={setConfirmPassword}
                isInvalid={passwordsMismatch}
                errorMessage={passwordsMismatch ? 'Пароли не совпадают' : undefined}
                endContent={
                  <button
                    type='button'
                    aria-label={isConfirmPasswordVisible ? 'Скрыть пароль' : 'Показать пароль'}
                    title={isConfirmPasswordVisible ? 'Скрыть пароль' : 'Показать пароль'}
                    onClick={() => setIsConfirmPasswordVisible((v) => !v)}
                    className='focus:outline-none text-foreground-500'
                  >
                    {isConfirmPasswordVisible ? <FiEyeOff size={16} /> : <FiEye size={16} />}
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
                Создать аккаунт
              </Button>
              <div className='text-sm text-foreground-600'>
                Уже есть аккаунт?{' '}
                <HeroUILink href='/auth/login' underline='hover'>
                  Войти
                </HeroUILink>
              </div>
            </Form>
          </CardBody>
        </Card>
      </div>
    </DefaultLayout>
  );
}
