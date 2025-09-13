'use client';

import { useState } from 'react';

import { useForm } from 'react-hook-form';

import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { useAuthStore } from '~/stores/auth-store';

const loginSchema = z.object({
  email: z.string().email('Некорректный email адрес'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const form = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginFormData) => {
    // Validate data manually
    const result = loginSchema.safeParse(data);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      Object.entries(errors).forEach(([field, messages]) => {
        if (messages && messages.length > 0 && (field === 'email' || field === 'password')) {
          form.setError(field, {
            type: 'manual',
            message: messages[0],
          });
        }
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    login(result.data)
      .then(() => {
        router.push('/');
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Произошла ошибка при входе');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Card>
      <CardHeader className='text-center'>
        <CardTitle className='text-2xl font-bold'>Вход в систему</CardTitle>
        <CardDescription>Введите ваш email и пароль для входа в аккаунт</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className='space-y-4'
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(form.getValues());
            }}
          >
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
                      <Input
                        {...field}
                        className='pl-10'
                        disabled={isLoading}
                        placeholder='Введите ваш email'
                        type='email'
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Пароль</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
                      <Input
                        {...field}
                        className='pl-10 pr-10'
                        disabled={isLoading}
                        placeholder='Введите ваш пароль'
                        type={showPassword ? 'text' : 'password'}
                      />
                      <Button
                        className='absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0'
                        disabled={isLoading}
                        size='sm'
                        type='button'
                        variant='ghost'
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className='h-4 w-4' />
                        ) : (
                          <Eye className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className='text-destructive text-sm font-medium bg-destructive/10 border border-destructive/20 rounded-md p-3'>
                {error}
              </div>
            )}

            <Button className='w-full' disabled={isLoading} type='submit'>
              {isLoading ? 'Вход...' : 'Войти'}
            </Button>
          </form>
        </Form>

        <div className='mt-6 text-center'>
          <p className='text-sm text-muted-foreground'>
            Нет аккаунта?{' '}
            <Link className='font-medium text-primary hover:underline' href='/auth/register'>
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
