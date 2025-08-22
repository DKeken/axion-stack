import { Button } from '@heroui/button';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/dropdown';
import { Tooltip } from '@heroui/tooltip';
import { User as HeroUser } from '@heroui/user';
import { useRouter } from '@tanstack/react-router';
import clsx from 'clsx';
import { FiMenu, FiMoreHorizontal } from 'react-icons/fi';
import { useShallow } from 'zustand/react/shallow';

import { NAV_ITEMS } from './nav-items';

import { LanguageSwitch } from '~/components/language-switch';
import { Logo } from '~/components/logo';
import { ThemeSwitch } from '~/components/theme-switch';
import { Link } from '~/routes/__root';
import { selectIsAuthenticated, useAuthStore } from '~/stores/auth-store';
import { useUIStore } from '~/stores/ui-store';

export function Topbar({ showLogo = false }: { showLogo?: boolean }) {
  const openMobileMenu = useUIStore(useShallow((s) => s.openMobileMenu));
  const router = useRouter();
  const { user, logout, initializing } = useAuthStore(
    useShallow((s) => ({ user: s.user, logout: s.logout, initializing: s.initializing }))
  );
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  const primaryItems = NAV_ITEMS.slice(0, 4);
  const overflowItems = NAV_ITEMS.slice(4);

  return (
    <header className='h-12 sticky top-0 z-20 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/50'>
      <div className='h-full w-full flex items-center gap-2 px-3'>
        {showLogo ? <Logo size='md' /> : null}
        <div className='md:hidden'>
          <Button
            isIconOnly
            size='sm'
            variant='light'
            aria-label='Open menu'
            onPress={openMobileMenu}
          >
            <FiMenu size={18} />
          </Button>
        </div>

        {/* Desktop Navigation */}
        <nav className='hidden md:flex items-center gap-1'>
          {primaryItems.map((item) => (
            <Tooltip key={item.to} content={item.label()} placement='bottom' delay={500}>
              {item.disabled ? (
                <div
                  aria-disabled
                  className={clsx(
                    'flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors',
                    'text-foreground-500 cursor-not-allowed opacity-60'
                  )}
                >
                  {item.icon({ size: 16 })}
                  <span className='hidden lg:inline'>{item.label()}</span>
                </div>
              ) : (
                <Link to={item.to} preload='intent' activeOptions={{ exact: item.to === '/' }}>
                  {({ isActive }) => (
                    <div
                      className={clsx(
                        'flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors',
                        isActive
                          ? 'bg-content3 text-foreground font-medium'
                          : 'hover:bg-content2 text-foreground-600'
                      )}
                    >
                      {item.icon({ size: 16 })}
                      <span className='hidden lg:inline'>{item.label()}</span>
                    </div>
                  )}
                </Link>
              )}
            </Tooltip>
          ))}

          {overflowItems.length > 0 && (
            <Dropdown placement='bottom-start'>
              <DropdownTrigger>
                <Button isIconOnly size='sm' variant='light' aria-label='More navigation'>
                  <FiMoreHorizontal size={18} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label='More navigation' selectionMode='single'>
                {overflowItems.map((item) => (
                  <DropdownItem
                    key={item.to}
                    isDisabled={Boolean(item.disabled)}
                    onPress={
                      item.disabled
                        ? undefined
                        : () => {
                            void router.navigate({ to: item.to });
                          }
                    }
                    startContent={item.icon({ size: 16 })}
                    textValue={item.label()}
                  >
                    {item.label()}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          )}
        </nav>

        <div className='ml-auto flex items-center gap-2'>
          {initializing ? (
            <div className='flex items-center gap-2'>
              <div className='w-8 h-8 rounded-full bg-content2 animate-pulse' />
              <div className='flex flex-col gap-1'>
                <div className='hidden sm:block w-28 h-3 rounded-md bg-content2 animate-pulse' />
                <div className='hidden sm:block w-14 h-3 rounded-md bg-content2 animate-pulse' />
              </div>
            </div>
          ) : isAuthenticated ? (
            <Dropdown placement='bottom-end'>
              <DropdownTrigger>
                <Button
                  size='sm'
                  variant='light'
                  className='px-1 py-0 bg-transparent min-w-0'
                  aria-label='User menu'
                >
                  <HeroUser
                    isFocusable
                    name={user?.name ?? user?.email ?? ''}
                    description={user?.email ?? ''}
                    avatarProps={{
                      src: user?.avatar ?? undefined,
                      name: user?.name ?? user?.email ?? 'U',
                      alt: 'User avatar',
                      className: 'w-6 h-6 overflow-hidden',
                    }}
                    classNames={{
                      base: 'py-1 rounded-lg hover:bg-content2 transition-colors max-w-[180px] sm:max-w-[220px]',
                      name: 'text-xs font-medium truncate max-w-full',
                      description: 'text-[10px] md:text-xs text-foreground-600 truncate max-w-full',
                    }}
                  />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label='User menu' selectionMode='single'>
                <DropdownItem
                  key='logout'
                  color='danger'
                  onPress={() => void logout()}
                  className='text-xs md:text-sm'
                >
                  Выйти
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <>
              <Link to='/auth/login'>
                <Button size='sm' variant='light'>
                  Вход
                </Button>
              </Link>
              <Link to='/auth/register'>
                <Button size='sm' color='primary'>
                  Регистрация
                </Button>
              </Link>
            </>
          )}
          <LanguageSwitch size='sm' />
          <ThemeSwitch size='sm' />
        </div>
      </div>
    </header>
  );
}
