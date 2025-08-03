import { createFileRoute } from '@tanstack/react-router';

import { WebTUIDemo } from '~/components/webtui-demo';

export const Route = createFileRoute('/demo')({
  component: Demo,
});

function Demo() {
  return <WebTUIDemo />;
}