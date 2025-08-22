import { FiBookOpen, FiCreditCard, FiHome } from 'react-icons/fi';

import { m } from '~/paraglide/messages';

export interface NavItem {
  to: string;
  label: () => string;
  icon: (props: { size?: number; className?: string }) => React.ReactNode;
  disabled?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: () => m['nav.home'](), icon: (p) => <FiHome {...p} /> },
  {
    to: '/billing',
    label: () => m['nav.billing'](),
    icon: (p) => <FiCreditCard {...p} />,
    disabled: true,
  },
  {
    to: '/docs',
    label: () => m['nav.docs'](),
    icon: (p) => <FiBookOpen {...p} />,
    disabled: true,
  },
];
