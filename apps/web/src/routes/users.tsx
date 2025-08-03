import { createFileRoute } from '@tanstack/react-router';

import { UsersList } from '~/components/users-list';

export const Route = createFileRoute('/users')({
  component: UsersPage,
});

function UsersPage() {
  return <UsersList />;
}
