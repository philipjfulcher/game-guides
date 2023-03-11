import { Menu, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { classNames } from "./util";
import { SupabaseClient } from "@supabase/auth-helpers-remix";

const menuLinks: { label: string; urlSegment: string }[] = [
  {
    label: "Reference",
    urlSegment: "reference"
  }
];

export function NavBarLinks({gameId,supabase}: {gameId: string,supabase: SupabaseClient}) {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setEmail(data.user.email);
      }


      supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" && session?.user?.email) {
          setEmail(session.user.email);
        } else if (event === "SIGNED_OUT") {
          setEmail(null);
        }
      });
    });
  }, [supabase]);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google"
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return <div className="hidden lg:block lg:w-80">
    <div className="flex items-center justify-end">
      <div className="flex">
        {menuLinks.map(link => {
          return <a
            key={link.urlSegment}
            href="#"
            className="rounded-md px-3 py-2 text-sm font-medium text-indigo-200 hover:text-white"
          >
            {link.label}
          </a>;
        })}
      </div>

      {/* Profile dropdown */}
      <Menu as="div" className="relative ml-4 flex-shrink-0">
        <div>
          <Menu.Button
            className="flex rounded-full bg-indigo-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700">
            <span className="sr-only">Open user menu</span>
            <img
              className="h-8 w-8 rounded-full"
              src="https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&h=256&q=80"
              alt=""
            />
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items
            className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">

            { email ? (<><Menu.Item>
              {({ active }) => (
                <button
                  className={classNames(
                    active ? "bg-gray-100" : "",
                    "block px-4 py-2 text-sm text-gray-700"
                  )}
                >
                  Welcome, {email}
                </button>
              )}
            </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={handleLogout}
                    className={classNames(
                      active ? "bg-gray-100" : "",
                      "block px-4 py-2 text-sm text-gray-700"
                    )}
                  >
                    Logout
                  </button>
                )}
              </Menu.Item>
            </>) : (<Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleGoogleLogin}
                  className={classNames(
                    active ? "bg-gray-100" : "",
                    "block px-4 py-2 text-sm text-gray-700"
                  )}
                >
                  Login
                </button>
              )}
            </Menu.Item>) }
            <Menu.Item>
              {({ active }) => (
                <a
                  href="#"
                  className={classNames(
                    active ? "bg-gray-100" : "",
                    "block px-4 py-2 text-sm text-gray-700"
                  )}
                >
                  Settings
                </a>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <a
                  href="#"
                  className={classNames(
                    active ? "bg-gray-100" : "",
                    "block px-4 py-2 text-sm text-gray-700"
                  )}
                >
                  Logout
                </a>
              )}
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  </div>;
};
