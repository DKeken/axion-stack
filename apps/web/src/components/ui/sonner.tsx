import { Toaster as Sonner, type ToasterProps } from 'sonner';

import { useThemeSafe } from '~/hooks/use-theme-resource';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme, isHydrated } = useThemeSafe();

  // До гидрации не рендерим тостер, чтобы избежать мерцания
  if (!isHydrated) {
    return null;
  }

  return (
    <Sonner
      className='toaster group'
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      theme={theme as 'light' | 'dark' | 'system'}
      {...props}
    />
  );
};

export { Toaster };
