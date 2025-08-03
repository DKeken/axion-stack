import * as React from 'react';

import type { CreateUserDto, UpdateUserDto, UserDto } from '@repo/backend/src/contracts';

import { Button, Badge, Input, Spinner } from '~/components/ui';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '~/hooks/use-users';

export function UsersList() {
  const [currentOffset, setCurrentOffset] = React.useState(0);
  const pageSize = 10;
  const [searchTerm, setSearchTerm] = React.useState('');

  // Fetch users with pagination and search
  const {
    data: usersResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useUsers({
    offset: currentOffset,
    limit: pageSize,
    q: searchTerm || undefined,
    sort: ['createdAt:desc'],
  });

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const userData: CreateUserDto = {
      email: formData.get('email') as string,
      name: formData.get('name') as string,
      password: formData.get('password') as string,
    };

    try {
      await createUserMutation.mutateAsync({ body: userData });
      // Reset form
      event.currentTarget.reset();
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleUpdateUser = async (id: string, data: UpdateUserDto) => {
    try {
      await updateUserMutation.mutateAsync({ params: { id }, body: data });
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await deleteUserMutation.mutateAsync({ params: { id } });
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  if (isLoading) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}
      >
        <Spinner />
        <span style={{ marginLeft: '1rem' }}>Loading users...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ border: '1px solid var(--red)', padding: '1rem', marginBottom: '1rem' }}>
          <h3>
            <Badge variant='red'>Error</Badge> Failed to load users
          </h3>
          <p style={{ marginTop: '0.5rem' }}>
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </p>
          <Button
            onClick={() => {
              void refetch();
            }}
            variant='red'
            style={{ marginTop: '1rem' }}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const users = usersResponse?.body?.items ?? [];
  const pagination = usersResponse?.body;

  return (
    <div style={{ padding: '1.5rem', maxWidth: '72rem', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1>Users Management</h1>
        <p>Manage users with TanStack Query</p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Input
          type='text'
          placeholder='Search users...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', maxWidth: '24rem' }}
        />
      </div>

      {/* Create User Form */}
      <div
        style={{ backgroundColor: 'var(--background1)', padding: '1.5rem', marginBottom: '2rem' }}
      >
        <h2>Create New User</h2>
        <form
          onSubmit={(e) => {
            void handleCreateUser(e);
          }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '1rem',
          }}
        >
          <Input name='email' type='email' placeholder='Email' required />
          <Input name='name' type='text' placeholder='Name' required />
          <Input name='password' type='password' placeholder='Password' required minLength={8} />
          <Button type='submit' disabled={createUserMutation.isPending} variant='foreground0'>
            {createUserMutation.isPending ? 'Creating...' : 'Create User'}
          </Button>
        </form>
      </div>

      {/* Users List */}
      <div
        style={{
          backgroundColor: 'var(--background0)',
          border: '1px solid var(--foreground2)',
        }}
      >
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--foreground2)' }}>
          <h2>Users {pagination && `(${pagination.total} total)`}</h2>
        </div>

        {users.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>No users found</div>
        ) : (
          <div>
            {users.map((user: UserDto) => (
              <div
                key={user.id}
                style={{
                  padding: '1rem',
                  borderBottom: '1px solid var(--foreground2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div>
                      <p>
                        <strong>{user.name ?? 'No name'}</strong>
                      </p>
                      <p style={{ marginTop: '0.25rem' }}>
                        <code>{user.email}</code>
                      </p>
                    </div>
                  </div>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', opacity: 0.7 }}>
                    Created: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button
                    onClick={() => {
                      void handleUpdateUser(user.id, { name: `Updated ${user.name}` });
                    }}
                    disabled={updateUserMutation.isPending}
                    variant='foreground1'
                    style={{ fontSize: '0.875rem' }}
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => {
                      void handleDeleteUser(user.id);
                    }}
                    disabled={deleteUserMutation.isPending}
                    variant='red'
                    style={{ fontSize: '0.875rem' }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.hasMore && (
          <div
            style={{
              padding: '1rem',
              borderTop: '1px solid var(--foreground2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: '0.875rem' }}>
              {pagination.total
                ? `Showing ${currentOffset + 1}-${Math.min(currentOffset + pageSize, pagination.total)} of ${pagination.total}`
                : `Showing ${users.length} items`}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                onClick={() => setCurrentOffset(Math.max(0, currentOffset - pageSize))}
                disabled={currentOffset === 0}
                variant='foreground2'
                style={{ fontSize: '0.875rem' }}
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentOffset(currentOffset + pageSize)}
                disabled={!pagination.hasMore}
                variant='foreground2'
                style={{ fontSize: '0.875rem' }}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
