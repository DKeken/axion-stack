'use client';

import React from 'react';

import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from '@tanstack/react-router';
import { z } from 'zod';

import { Alert, AlertDescription } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Spinner } from '~/components/ui/shadcn-io/spinner';
import { useToast } from '~/hooks/use-toast';
import { useAuthOperations } from '~/stores/auth-store';
import { generateFingerprint } from '~/utils/fingerprint';

// Validation schema matching the backend contract
const registerSchema = z
  .object({
    email: z.string().email('Неверный формат email'),
    password: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
    name: z.string().min(1, 'Имя обязательно').max(100, 'Имя слишком длинное'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function RegisterForm({ onSuccess, redirectTo = '/' }: RegisterFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { register, isLoading, error } = useAuthOperations();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = data;

      await register(
        registerData.email,
        registerData.password,
        registerData.name,
        generateFingerprint()
      );

      toast({
        title: 'Регистрация успешна',
        description: 'Добро пожаловать! Ваш аккаунт создан.',
      });

      if (onSuccess) {
        onSuccess();
      } else {
        await router.navigate({ to: redirectTo });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && error.message?.includes('already exists')
          ? 'Пользователь с таким email уже существует'
          : 'Ошибка при регистрации. Попробуйте снова.';

      toast({
        title: 'Ошибка регистрации',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold text-center'>Регистрация</CardTitle>
        <CardDescription className='text-center'>
          Создайте новый аккаунт для доступа к системе
        </CardDescription>
      </CardHeader>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          // handleSubmit returns a function that expects the event, so we call it here
          // This ensures the handler is sync and avoids returning a Promise to onSubmit
          void form.handleSubmit(onSubmit)(e);
        }}
      >
        <CardContent className='space-y-4'>
          {error && (
            <Alert variant='destructive'>
              <AlertDescription>
                {typeof error === 'string' && error.includes('already exists')
                  ? 'Пользователь с таким email уже существует'
                  : 'Ошибка при регистрации. Попробуйте снова.'}
              </AlertDescription>
            </Alert>
          )}

          <div className='space-y-2'>
            <Label htmlFor='name'>Имя</Label>
            <Input
              id='name'
              type='text'
              placeholder='Ваше имя'
              {...form.register('name')}
              disabled={isLoading}
            />
            {form.formState.errors.name && (
              <p className='text-sm text-destructive'>{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              placeholder='example@domain.com'
              {...form.register('email')}
              disabled={isLoading}
            />
            {form.formState.errors.email && (
              <p className='text-sm text-destructive'>{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='password'>Пароль</Label>
            <Input
              id='password'
              type='password'
              placeholder='••••••••'
              {...form.register('password')}
              disabled={isLoading}
            />
            {form.formState.errors.password && (
              <p className='text-sm text-destructive'>{form.formState.errors.password.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='confirmPassword'>Подтвердите пароль</Label>
            <Input
              id='confirmPassword'
              type='password'
              placeholder='••••••••'
              {...form.register('confirmPassword')}
              disabled={isLoading}
            />
            {form.formState.errors.confirmPassword && (
              <p className='text-sm text-destructive'>
                {form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className='flex flex-col space-y-4'>
          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner className='mr-2 h-4 w-4' />
                Регистрация...
              </>
            ) : (
              'Зарегистрироваться'
            )}
          </Button>

          <div className='text-center text-sm'>
            <span className='text-muted-foreground'>Уже есть аккаунт? </span>
            <Button
              type='button'
              variant='link'
              className='p-0 h-auto'
              onClick={() => {
                void router.navigate({ to: '/auth/login' });
              }}
            >
              Войти
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
