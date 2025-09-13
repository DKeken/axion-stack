'use client';

import { User, Mail, Calendar } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

import { Avatar } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { useAuthStore } from '~/stores/auth-store';

export function UserInfo() {
  const { user } = useAuthStore(useShallow((state) => ({ user: state.user })));

  if (!user) {
    return null;
  }

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader className='text-center'>
        <div className='flex justify-center mb-4'>
          <Avatar className='h-20 w-20'>
            <div className='flex items-center justify-center h-full w-full bg-primary/10 text-primary'>
              <User className='h-8 w-8' />
            </div>
          </Avatar>
        </div>
        <CardTitle className='text-xl'>Информация о пользователе</CardTitle>
        <CardDescription>Ваши данные в системе</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {user.name && (
          <div className='flex items-center space-x-3'>
            <User className='h-4 w-4 text-muted-foreground' />
            <div>
              <p className='text-sm font-medium'>Имя</p>
              <p className='text-sm text-muted-foreground'>{user.name}</p>
            </div>
          </div>
        )}

        <div className='flex items-center space-x-3'>
          <Mail className='h-4 w-4 text-muted-foreground' />
          <div>
            <p className='text-sm font-medium'>Email</p>
            <p className='text-sm text-muted-foreground'>{user.email}</p>
          </div>
        </div>

        <div className='flex items-center space-x-3'>
          <Calendar className='h-4 w-4 text-muted-foreground' />
          <div>
            <p className='text-sm font-medium'>Дата регистрации</p>
            <p className='text-sm text-muted-foreground'>
              {new Date(user.createdAt).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className='pt-2'>
          <Badge className='w-full justify-center' variant='secondary'>
            ID: {user.id}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
