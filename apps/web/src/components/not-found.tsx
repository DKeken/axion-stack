import Link from 'next/link';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader } from '~/components/ui/card';

export function NotFound({ children }: { children?: React.ReactNode }) {
  return (
    <div className='flex flex-1 items-center justify-center min-h-[60vh]'>
      <Card className='w-full max-w-md shadow-lg'>
        <CardHeader>
          <h3 className='text-lg font-semibold'>Page not found</h3>
        </CardHeader>
        <CardContent className='flex flex-col gap-4'>
          <div className='text-muted-foreground'>
            {children ?? <p>The page you are looking for does not exist.</p>}
          </div>
          <div className='flex items-center gap-2 flex-wrap'>
            <Button
              variant='default'
              onClick={() => {
                window.history.back();
              }}
            >
              Go Back
            </Button>
            <Button asChild variant='outline'>
              <Link href='/'>Start Over</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
