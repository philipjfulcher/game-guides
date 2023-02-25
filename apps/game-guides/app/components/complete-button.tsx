import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { CheckBadgeIcon as OutlineCheckBadgeIcon } from '@heroicons/react/24/outline';

export default function CompleteButton({
  completed,
  creating,
}: {
  completed: boolean;
  creating: boolean;
}) {
  return completed ? (
    <button
      type="submit"
      className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      <CheckBadgeIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
      Completed!
    </button>
  ) : (
    <button
      type="submit"
      className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      <OutlineCheckBadgeIcon
        className="-ml-1 mr-3 h-5 w-5"
        aria-hidden="true"
      />
      {creating ? 'Marking...' : 'Mark Complete'}
    </button>
  );
}
