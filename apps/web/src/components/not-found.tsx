import { Button } from '@heroui/button';
import { Card, CardBody, CardHeader } from '@heroui/card';

import { Link } from '~/routes/__root';

export function NotFound({ children }: { children?: React.ReactNode }) {
  return (
    <div className='flex flex-1 items-center justify-center min-h-[60vh]'>
      <Card className='w-full max-w-md shadow-lg'>
        <CardHeader>
          <h3 className='text-lg font-semibold'>Page not found</h3>
        </CardHeader>
        <CardBody className='flex flex-col gap-4'>
          <div className='text-muted-foreground'>
            {children ?? <p>The page you are looking for does not exist.</p>}
          </div>
          <div className='flex items-center gap-2 flex-wrap'>
            <Button
              variant='solid'
              onClick={() => {
                window.history.back();
              }}
            >
              Go Back
            </Button>
            <Button variant='flat'>
              <Link to='/'>Start Over</Link>
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
