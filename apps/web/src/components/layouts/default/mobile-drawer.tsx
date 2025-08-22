import { useEffect } from 'react';

import { Button } from '@heroui/button';
import { ScrollShadow } from '@heroui/scroll-shadow';
import { Tab, Tabs } from '@heroui/tabs';
import clsx from 'clsx';
import { FiGrid, FiNavigation, FiX } from 'react-icons/fi';
import { useShallow } from 'zustand/react/shallow';

import { NAV_ITEMS } from './nav-items';

import { Logo } from '~/components/logo';
import { m } from '~/paraglide/messages';
import { Link } from '~/routes/__root';
import { useUIStore } from '~/stores/ui-store';

interface MobileDrawerProps {
  children?: React.ReactNode;
}

export function MobileDrawer({ children }: MobileDrawerProps) {
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore(
    useShallow((s) => ({
      isMobileMenuOpen: s.isMobileMenuOpen,
      closeMobileMenu: s.closeMobileMenu,
    }))
  );

  // Prevent background scroll and enable ESC to close when open
  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMobileMenu();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isMobileMenuOpen, closeMobileMenu]);

  return (
    <div
      className={clsx(
        'fixed inset-0 z-40 md:hidden transition-[visibility] duration-200',
        isMobileMenuOpen ? 'visible' : 'invisible'
      )}
      aria-hidden={!isMobileMenuOpen}
    >
      {/* Overlay */}
      <div
        className={clsx(
          'absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity duration-200',
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={closeMobileMenu}
      />

      {/* Drawer */}
      <aside
        role='dialog'
        aria-modal='true'
        aria-label='Mobile menu'
        className={clsx(
          'absolute left-0 top-0 h-full w-72 bg-background/90 supports-[backdrop-filter]:bg-background/75',
          'backdrop-blur-xl border-r border-divider/60 shadow-2xl flex flex-col',
          'will-change-transform transition-transform duration-200 ease-out',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header (match desktop look) */}
        <div className='h-12 flex items-center justify-between px-3 border-b border-divider/40'>
          <Logo size='sm' />
          <Button
            isIconOnly
            size='sm'
            variant='light'
            aria-label='Close menu'
            onPress={closeMobileMenu}
          >
            <FiX size={18} />
          </Button>
        </div>

        {/* Content */}
        <div className='flex-1 flex flex-col overflow-hidden'>
          <Tabs
            defaultSelectedKey='navigation'
            classNames={{
              base: 'px-3',
              tabList:
                'w-full mt-2 bg-content1/60 rounded-md p-1 border border-divider/50 backdrop-blur supports-[backdrop-filter]:bg-content1/40',
              cursor: 'bg-content3',
              tab: 'h-9 px-2 data-[selected=true]:text-foreground text-foreground-600',
              tabContent: 'gap-2',
              panel: 'flex-1 px-0 py-0 overflow-hidden',
            }}
          >
            <Tab
              key='navigation'
              title={
                <div className='flex items-center gap-2'>
                  <FiNavigation size={16} />
                  <span>{m['nav.home']()}</span>
                </div>
              }
            >
              <ScrollShadow className='h-full px-3 py-2' hideScrollBar>
                <nav className='flex flex-col gap-1'>
                  {NAV_ITEMS.map((item) =>
                    item.disabled ? (
                      <div
                        key={item.to}
                        aria-disabled
                        className={clsx(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                          'text-foreground-500 cursor-not-allowed opacity-60'
                        )}
                      >
                        {item.icon({ size: 18, className: 'shrink-0' })}
                        <span>{item.label()}</span>
                      </div>
                    ) : (
                      <Link
                        key={item.to}
                        to={item.to}
                        preload='intent'
                        activeOptions={{ exact: item.to === '/' }}
                        onClick={closeMobileMenu}
                      >
                        {({ isActive }) => (
                          <div
                            className={clsx(
                              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                              isActive
                                ? 'bg-content3 text-foreground font-medium'
                                : 'hover:bg-content2 text-foreground-600'
                            )}
                          >
                            {item.icon({ size: 18, className: 'shrink-0' })}
                            <span>{item.label()}</span>
                          </div>
                        )}
                      </Link>
                    )
                  )}
                </nav>
              </ScrollShadow>
            </Tab>

            <Tab
              key='tools'
              title={
                <div className='flex items-center gap-2'>
                  <FiGrid size={16} />
                  <span>{m['nav.tools']()}</span>
                </div>
              }
            >
              <ScrollShadow className='h-full px-3 py-2' hideScrollBar>
                {children ?? (
                  <div className='flex items-center justify-center h-32 text-foreground-500'>
                    <span className='text-sm'>{m['nav.noTools']()}</span>
                  </div>
                )}
              </ScrollShadow>
            </Tab>
          </Tabs>
        </div>
      </aside>
    </div>
  );
}
