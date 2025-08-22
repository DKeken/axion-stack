import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';
import {
  ErrorComponent,
  type ErrorComponentProps,
  rootRouteId,
  useMatch,
  useRouter,
} from '@tanstack/react-router';

import { Link } from '~/routes/__root';

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
          <h3 className='text-lg font-semibold'>Something went wrong</h3>
        </CardHeader>
        <CardBody className='flex flex-col items-center gap-6'>
          <ErrorComponent error={error} />
          <div className='flex gap-2 items-center flex-wrap'>
            <Button
              variant='solid'
              onClick={() => {
                void router.invalidate();
              }}
            >
              Try Again
            </Button>
            {isRoot ? (
              <Button variant='flat'>
                <Link to='/'>Home</Link>
              </Button>
            ) : (
              <Button
                variant='flat'
                onClick={(e) => {
                  e.preventDefault();
                  window.history.back();
                }}
              >
                <Link to='/'>Go Back</Link>
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
