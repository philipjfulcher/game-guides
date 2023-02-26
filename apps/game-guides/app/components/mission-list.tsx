/* This example requires Tailwind CSS v2.0+ */
import { CheckCircleIcon } from '@heroicons/react/24/solid';

import { StepSummary } from '~/../../../../libs/mass-effect/data-access/src/lib/data-steps';
import { Link } from '@remix-run/react';

export default function MissionList({
  steps,
  currentStep,
}: {
  steps: StepSummary[];
  currentStep: string;
}) {
  return (
    <div className="w-72">
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <nav className="flex justify-center" aria-label="Progress">
          <ol role="list" className="space-y-6">
            {steps.map((step) => (
              <li key={step.title}>
                {step.completed ? (
                  <Link
                    to={`/mass-effect-2/act/${step.actId}/step/${step.id}`}
                    prefetch="intent"
                    className="group"
                  >
                    <span className="flex items-start">
                      <span className="flex-shrink-0 relative h-5 w-5 flex items-center justify-center">
                        <CheckCircleIcon
                          className="h-full w-full text-indigo-600 group-hover:text-indigo-800"
                          aria-hidden="true"
                        />
                      </span>
                      <span className="ml-3 text-sm font-medium text-gray-500 group-hover:text-gray-900">
                        {step.title}
                      </span>
                    </span>
                  </Link>
                ) : step.id === currentStep ? (
                  <Link
                    to={`/mass-effect-2/act/${step.actId}/step/${step.id}`}
                    prefetch="intent"
                    className="flex items-start"
                    aria-current="step"
                  >
                    <span
                      className="flex-shrink-0 h-5 w-5 relative flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <span className="absolute h-4 w-4 rounded-full bg-indigo-200" />
                      <span className="relative block w-2 h-2 bg-indigo-600 rounded-full" />
                    </span>
                    <span className="ml-3 text-sm font-medium text-indigo-600">
                      {step.title}
                    </span>
                  </Link>
                ) : (
                  <Link
                    to={`/mass-effect-2/act/${step.actId}/step/${step.id}`}
                    prefetch="intent"
                    className="group"
                  >
                    <div className="flex items-start">
                      <div
                        className="flex-shrink-0 h-5 w-5 relative flex items-center justify-center"
                        aria-hidden="true"
                      >
                        <div className="h-2 w-2 bg-gray-300 rounded-full group-hover:bg-gray-400" />
                      </div>
                      <p className="ml-3 text-sm font-medium text-gray-500 group-hover:text-gray-900">
                        {step.title}
                      </p>
                    </div>
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  );
}
