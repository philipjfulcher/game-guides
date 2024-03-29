import { createServerClient } from '@supabase/auth-helpers-remix';
import { Database } from './supabase-models';

export function createSupabaseServerClient({
  request,
  response,
}: {
  request: Request;
  response: Response;
}) {
  return createServerClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { request, response }
  );
}
