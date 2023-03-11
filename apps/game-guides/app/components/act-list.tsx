import { Link } from '@remix-run/react';
import { CheckIcon } from '@heroicons/react/24/solid';
import { Act } from '@game-guides/models';

export function ActList({
  gameId,
  acts,
  currentAct,
}: {
  gameId: string;
  acts: Act[];
  currentAct: string;
}) {
  return (
    <nav aria-label="Progress">
      <ol
        role="list"
        className="border border-gray-300 rounded-md divide-y divide-gray-300 md:flex md:divide-y-0"
      >
        {acts.map((act, actIdx) => (
          <li key={act.title} className="relative md:flex-1 md:flex">
            {act.completed ? (
              <Link
                to={`/${gameId}/act/${act.id}`}
                prefetch="intent"
                className="group flex items-center w-full"
              >
                <span className="px-6 py-4 flex items-center text-sm font-medium">
                  <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-indigo-600 rounded-full group-hover:bg-indigo-800">
                    <CheckIcon
                      className="w-6 h-6 text-white"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="ml-4 text-sm font-medium text-gray-900">
                    {act.title}
                  </span>
                </span>
              </Link>
            ) : act.id === currentAct ? (
              <Link
                to={`/${gameId}/act/${act.id}`}
                prefetch="intent"
                className="px-6 py-4 flex items-center text-sm font-medium"
                aria-current="step"
              >
                <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center border-2 border-indigo-600 rounded-full">
                  <span className="text-indigo-600">{actIdx + 1}</span>
                </span>
                <span className="ml-4 text-sm font-medium text-indigo-600">
                  {act.title}
                </span>
              </Link>
            ) : (
              <Link
                to={`/${gameId}/act/${act.id}`}
                prefetch="intent"
                className="group flex items-center"
              >
                <span className="px-6 py-4 flex items-center text-sm font-medium">
                  <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-full group-hover:border-gray-400">
                    <span className="text-gray-500 group-hover:text-gray-900">
                      {actIdx + 1}
                    </span>
                  </span>
                  <span className="ml-4 text-sm font-medium text-gray-500 group-hover:text-gray-900">
                    {act.title}
                  </span>
                </span>
              </Link>
            )}

            {actIdx !== acts.length - 1 ? (
              <>
                {/* Arrow separator for lg screens and up */}
                <div
                  className="hidden md:block absolute top-0 right-0 h-full w-5"
                  aria-hidden="true"
                >
                  <svg
                    className="h-full w-full text-gray-300"
                    viewBox="0 0 22 80"
                    fill="none"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 -2L20 40L0 82"
                      vectorEffect="non-scaling-stroke"
                      stroke="currentcolor"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
