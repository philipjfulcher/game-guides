import { useOutletContext } from '@remix-run/react';
import { SupabaseClient } from '@supabase/auth-helpers-remix';
import { useEffect, useState } from 'react';

export function Login() {
  const { supabase } = useOutletContext<{ supabase: SupabaseClient }>();
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
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      {email ? (
        <>
          Welcome, {email}
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <button onClick={handleGoogleLogin}>Login</button>
      )}
    </>
  );
}
