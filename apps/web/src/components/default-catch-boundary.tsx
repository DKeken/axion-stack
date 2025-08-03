import {
  ErrorComponent,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
  type ErrorComponentProps,
} from '@tanstack/react-router';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId,
  });

  console.error('DefaultCatchBoundary Error:', error);

  return (
    <div className='flex flex-1 items-center justify-center min-h-[60vh]'>
      <Card className='w-full max-w-md shadow-lg'>
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col items-center gap-6'>
          <ErrorComponent error={error} />
          <div className='flex gap-2 items-center flex-wrap'>
            <Button
              variant='default'
              onClick={() => {
                void router.invalidate();
              }}
            >
              Try Again
            </Button>
            {isRoot ? (
              <Button asChild variant='secondary'>
                <Link to='/'>Home</Link>
              </Button>
            ) : (
              <Button
                asChild
                variant='secondary'
                onClick={(e) => {
                  e.preventDefault();
                  window.history.back();
                }}
              >
                <Link to='/'>Go Back</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
