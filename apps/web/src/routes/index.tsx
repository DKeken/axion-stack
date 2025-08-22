import { createFileRoute } from '@tanstack/react-router';

import DefaultLayout from '~/components/layouts/default';
import { m } from '~/paraglide/messages';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

function LandingPage() {
  return (
    <DefaultLayout>
      <section className='flex flex-col items-center justify-center gap-4 py-8 md:py-10'>
        <h1>{m.example_message({ username: 'John' })}</h1>
      </section>
    </DefaultLayout>
  );
}
