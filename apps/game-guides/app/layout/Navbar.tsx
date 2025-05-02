import { Disclosure } from '@headlessui/react';
import { Bars3CenterLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { GameSelectMenu, SelectMenuItem } from './GameSelectMenu';
import { NavBarLinks } from './NavBarLinks';
import { useParams } from '@remix-run/react';
import { SupabaseClient } from '@supabase/auth-helpers-remix';

const menuItems: SelectMenuItem[] = [
  {
    id: 'mass-effect-2',
    label: 'Mass Effect 2',
  },
  {
    id: 'kh-bbs',
    label: 'Kingdom Hearts: Birth by Sleep',
  },
  {
    id: 'metroid-prime-remastered',
    label: 'Metroid Prime Remastered',
  },
  {
    id: 'persona-3',
    label: 'Persona 3',
  },
  {
    id: 'dq1',
    label: 'Dragon Quest 1',
  },
  {
    id: 'dq2',
    label: 'Dragon Quest 2',
  },
];

export function Navbar({
  supabase,
  redirectUri,
}: {
  supabase: SupabaseClient;
  redirectUri: string;
}): JSX.Element {
  const { gameId } = useParams() as { gameId: string };

  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setEmail(data.user.email);
      }

      supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user?.email) {
          setEmail(session.user.email);
        } else if (event === 'SIGNED_OUT') {
          setEmail(null);
        }
      });
    });
  }, [supabase]);
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <Disclosure as="nav" className="flex-shrink-0 bg-indigo-600">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              {/* Logo section */}
              <div className="flex items-center px-2 lg:px-0 xl:w-64">
                <div className="flex-shrink-0">
                  <img
                    className="h-8 w-auto"
                    src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=300"
                    alt="Your Company"
                  />
                </div>
              </div>

              <div className="flex flex-1 justify-center lg:justify-end">
                <div className="w-full px-2 lg:px-6">
                  <GameSelectMenu
                    items={menuItems}
                    selectedItemId={gameId}
                  ></GameSelectMenu>
                </div>
              </div>

              <div className="flex lg:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-indigo-600 p-2 text-indigo-400 hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3CenterLeftIcon
                      className="block h-6 w-6"
                      aria-hidden="true"
                    />
                  )}
                </Disclosure.Button>
              </div>

              <NavBarLinks
                gameId={gameId}
                supabase={supabase}
                redirectUri={redirectUri}
              ></NavBarLinks>
            </div>
          </div>

          <Disclosure.Panel className="lg:hidden">
            <div className="px-2 pt-2 pb-3">
              <Disclosure.Button
                as="a"
                href="#"
                className="block rounded-md bg-indigo-800 px-3 py-2 text-base font-medium text-white"
              >
                Dashboard
              </Disclosure.Button>
              <Disclosure.Button
                as="a"
                href="#"
                className="mt-1 block rounded-md px-3 py-2 text-base font-medium text-indigo-200 hover:bg-indigo-600 hover:text-indigo-100"
              >
                Support
              </Disclosure.Button>
            </div>
            <div className="border-t border-indigo-800 pt-4 pb-3">
              <div className="px-2">
                {email ? (
                  <>
                    <Disclosure.Button
                      as="button"
                      className="block rounded-md px-3 py-2 text-base font-medium text-indigo-200 hover:bg-indigo-600 hover:text-indigo-100"
                    >
                      Welcome, {email}
                    </Disclosure.Button>
                    <Disclosure.Button
                      as="button"
                      onClick={handleLogout}
                      className="block rounded-md px-3 py-2 text-base font-medium text-indigo-200 hover:bg-indigo-600 hover:text-indigo-100"
                    >
                      Logout
                    </Disclosure.Button>
                  </>
                ) : (
                  <Disclosure.Button
                    as="button"
                    onClick={handleGoogleLogin}
                    className="mt-1 block rounded-md px-3 py-2 text-base font-medium text-indigo-200 hover:bg-indigo-600 hover:text-indigo-100"
                  >
                    Login
                  </Disclosure.Button>
                )}
                <Disclosure.Button
                  as="a"
                  href="#"
                  className="mt-1 block rounded-md px-3 py-2 text-base font-medium text-indigo-200 hover:bg-indigo-600 hover:text-indigo-100"
                >
                  Settings
                </Disclosure.Button>
                <Disclosure.Button
                  as="a"
                  href="#"
                  className="mt-1 block rounded-md px-3 py-2 text-base font-medium text-indigo-200 hover:bg-indigo-600 hover:text-indigo-100"
                >
                  Sign out
                </Disclosure.Button>
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
