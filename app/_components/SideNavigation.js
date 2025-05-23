"use client"

import {
  CalendarDaysIcon,
  HomeIcon,
  UserIcon,
} from '@heroicons/react/24/solid';
import SignOutButton from '@/app/_components/SignOutButton';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PathnameContext } from 'next/dist/shared/lib/hooks-client-context.shared-runtime';

const linkClasses = "h-5 w-5 text-primary-600"

const navLinks = [
  {
    name: 'Home',
    href: '/account',
    icon: <HomeIcon className={linkClasses} />,
  },
  {
    name: 'Reservations',
    href: '/account/reservations',
    icon: <CalendarDaysIcon className={linkClasses} />,
  },
  {
    name: 'Guest profile',
    href: '/account/profile',
    icon: <UserIcon className={linkClasses} />,
  },
];

function SideNavigation() {
  const pathName = usePathname()

  return (
    <nav className='border-r border-primary-900'>
      <ul className='flex flex-col gap-2 h-full text-lg'>
        {navLinks.map((link) => (
          <li key={link.name}>
            <Link
              className={
                `py-3 px-5 hover:bg-primary-900 hover:text-primary-100 transition-colors 
                flex items-center gap-4 font-semibold text-primary-200
                ${pathName === link.href ? 'bg-primary-900' : '' }`
              }
              href={link.href}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          </li>
        ))}

        {/* <li className='mt-auto absolute bottom-10'> */}
        <li className='mt-auto bottom-10'>
          <SignOutButton />
        </li>
      </ul>
    </nav>
  );
}

export default SideNavigation;
