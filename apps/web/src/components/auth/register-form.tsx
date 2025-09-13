'use client';

import { useState } from 'react';

import { useForm } from 'react-hook-form';

import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
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

const registerSchema = z
  .object({
    name: z.string().min(2, 'Имя должно содержать минимум 2 символа').optional(),
    email: z.string().email('Некорректный email адрес'),
    password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const register = useAuthStore((state) => state.register);

  const form = useForm<RegisterFormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    // Validate data manually
    const result = registerSchema.safeParse(data);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      Object.entries(errors).forEach(([field, messages]) => {
        if (
          messages &&
          messages.length > 0 &&
          (field === 'name' ||
            field === 'email' ||
            field === 'password' ||
            field === 'confirmPassword')
        ) {
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

    register({
      email: result.data.email,
      password: result.data.password,
      name: result.data.name || undefined,
    })
      .then(() => {
        router.push('/');
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Произошла ошибка при регистрации');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <Card>
      <CardHeader className='text-center'>
        <CardTitle className='text-2xl font-bold'>Регистрация</CardTitle>
        <CardDescription>Создайте новый аккаунт для доступа к системе</CardDescription>
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
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Имя (необязательно)</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
                      <Input
                        {...field}
                        className='pl-10'
                        disabled={isLoading}
                        placeholder='Введите ваше имя'
                        type='text'
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                        placeholder='Введите пароль'
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

            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Подтвердите пароль</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
                      <Input
                        {...field}
                        className='pl-10 pr-10'
                        disabled={isLoading}
                        placeholder='Повторите пароль'
                        type={showConfirmPassword ? 'text' : 'password'}
                      />
                      <Button
                        className='absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0'
                        disabled={isLoading}
                        size='sm'
                        type='button'
                        variant='ghost'
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
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
              {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
          </form>
        </Form>

        <div className='mt-6 text-center'>
          <p className='text-sm text-muted-foreground'>
            Уже есть аккаунт?{' '}
            <Link className='font-medium text-primary hover:underline' href='/auth/login'>
              Войти
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
