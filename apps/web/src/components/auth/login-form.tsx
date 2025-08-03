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

const loginSchema = z.object({
  email: z.string().email('Неверный формат email'),
  password: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function LoginForm({ onSuccess, redirectTo = '/' }: LoginFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { login, isLoading, error } = useAuthOperations();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password, generateFingerprint());

      toast({
        title: 'Вход выполнен успешно',
        description: 'Добро пожаловать!',
      });

      if (onSuccess) {
        onSuccess();
      } else {
        void router.navigate({ to: redirectTo });
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      toast({
        title: 'Ошибка входа',
        description: 'Неверный email или пароль',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader className='space-y-1'>
        <CardTitle className='text-2xl font-bold text-center'>Вход</CardTitle>
        <CardDescription className='text-center'>
          Введите email и пароль для входа в систему
        </CardDescription>
      </CardHeader>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit(onSubmit)(e);
        }}
      >
        <CardContent className='space-y-4'>
          {error && (
            <Alert variant='destructive'>
              <AlertDescription>Неверный email или пароль. Попробуйте снова.</AlertDescription>
            </Alert>
          )}

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
        </CardContent>

        <CardFooter className='flex flex-col space-y-4'>
          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner className='mr-2 h-4 w-4' />
                Вход...
              </>
            ) : (
              'Войти'
            )}
          </Button>

          <div className='text-center text-sm'>
            <span className='text-muted-foreground'>Нет аккаунта? </span>
            <Button
              type='button'
              variant='link'
              className='p-0 h-auto'
              onClick={() => {
                void router.navigate({ to: '/auth/register' });
              }}
            >
              Зарегистрироваться
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
