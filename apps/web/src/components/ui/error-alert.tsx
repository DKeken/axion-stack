import { Alert, AlertDescription, AlertTitle, AlertIcons } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';

interface ErrorAlertProps {
  title: string;
  message: string;
  onDismiss: () => void;
}

export function ErrorAlert({ title, message, onDismiss }: ErrorAlertProps) {
  return (
    <Alert className='mb-6' variant='destructive'>
      <AlertIcons.destructive aria-hidden className='h-4 w-4' />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p className='text-sm'>{message}</p>
        <Button className='mt-3' size='sm' variant='outline' onClick={onDismiss}>
          Закрыть
        </Button>
      </AlertDescription>
    </Alert>
  );
}
