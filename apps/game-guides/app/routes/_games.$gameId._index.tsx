import { LoaderArgs, redirect } from '@remix-run/node';

export function loader({ params }: LoaderArgs) {
  return redirect(`/${params.gameId}/act`);
}
