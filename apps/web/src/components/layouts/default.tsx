import { DesktopSidebar } from './default/desktop-sidebar';
import { MobileDrawer } from './default/mobile-drawer';
import { Topbar } from './default/topbar';
import { getSidebarContent } from './sidebars';

import { useCurrentModule } from '~/hooks/use-current-module';

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  const currentModule = useCurrentModule();
  const sidebarContent = getSidebarContent(currentModule);

  const hasSidebar = Boolean(sidebarContent);

  return (
    <div className='h-screen w-full flex bg-background text-foreground'>
      {hasSidebar ? <DesktopSidebar>{sidebarContent}</DesktopSidebar> : null}

      <div className='flex-1 flex flex-col min-w-0'>
        <Topbar showLogo={!hasSidebar} />
        <main className='container mx-auto max-w-7xl px-6 flex-1 py-6'>{children}</main>
        <footer className='w-full flex items-center justify-center py-3' />
      </div>

      <MobileDrawer>{sidebarContent}</MobileDrawer>
    </div>
  );
}
