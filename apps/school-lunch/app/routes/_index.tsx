import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isMonday,
  isWeekend,
  lightFormat,
  nextMonday,
  startOfMonth,
} from 'date-fns';

function classNames(...classes: Array<string | null>) {
  return classes.filter(Boolean).join(' ');
}

interface Day {
  dateAsString: string;
  options: string[];
}

const filterList = [
  ' on Whole Wheat Bread',
  ' on a Whole Wheat Bun',
  "Domino's ",
  '(K-5)',
  '(6-12)',
];

function filterOption(option: string) {
  return filterList.reduce((acc, cur) => acc.replace(cur, ''), option).trim();
}

export const loader = async () => {
  const today = new Date();
  const startOfThisMonth = startOfMonth(today);
  const startDate = isMonday(startOfThisMonth)
    ? startOfThisMonth
    : nextMonday(startOfThisMonth);
  const endDate = endOfWeek(endOfMonth(today));
  const buildingId = 'cf92837d-dcb4-eb11-a2c3-bb7f12070043';
  const districtId = 'cb621126-efb1-eb11-a2cc-d41c38442056';
  const response = await fetch(
    `https://api.linqconnect.com/api/FamilyMenu?buildingId=${buildingId}&districtId=${districtId}&startDate=${lightFormat(
      startDate,
      'M-d-yyyy'
    )}&endDate=${lightFormat(endDate, 'M-d-yyyy')}`,
    {
      headers: { accepts: 'application/json' },
    }
  );

  const body = await response.json();

  const lunches = body.FamilyMenuSessions.find(
    (session: any) => session.ServingSession === 'Lunch'
  );

  if (!lunches) {
    return json({ currentMonth: format(today, 'MMMM yyyy'), days: [] });
  }

  const days: Day[] = lunches.MenuPlans[0].Days.map((day: any) => ({
    dateAsString: day.Date,
    options:
      [
        ...new Set(
          day.MenuMeals[0].RecipeCategories.find(
            (category: any) => category.CategoryName === 'Main Entree'
          )?.Recipes.map((recipe: any) => filterOption(recipe.RecipeName))
        ),
      ] ?? [],
  }));

  const actualDays: (null | Day)[] = eachDayOfInterval({
    start: startDate,
    end: endDate,
  })
    .map((date) => {
      if (isWeekend(date)) {
        return null;
      } else {
        return (
          days.find(
            (day) => day.dateAsString === lightFormat(date, 'M/d/yyyy')
          ) ?? {
            dateAsString: lightFormat(date, 'M/d/yyyy'),
            options: [],
          }
        );
      }
    })
    .filter((day) => day !== null);

  return json({ currentMonth: format(today, 'MMMM yyyy'), days: actualDays });
};

export default function Calendar() {
  const { days, currentMonth } = useLoaderData<typeof loader>();

  return (
    <div className={'flex p-1'}>
      <section className="text-center">
        <h2 className="font-semibold text-gray-900 text-2xl">{currentMonth}</h2>
        <div className="mt-1 grid grid-cols-5 text-xs leading-6 text-gray-500">
          <div>M</div>
          <div>T</div>
          <div>W</div>
          <div>T</div>
          <div>F</div>
        </div>
        <div className="isolate mt-2 grid grid-cols-5 gap-px rounded-lg bg-gray-500 text-xs shadow ring-1 ring-gray-500">
          {days.map((day, dayIdx) => {
            return (
              <div
                key={day?.dateAsString}
                className={classNames(
                  'bg-white text-gray-900',
                  dayIdx === 0 ? 'rounded-tl-lg' : null,
                  dayIdx === 4 ? 'rounded-tr-lg' : null,
                  dayIdx === days.length - 5 ? 'rounded-bl-lg' : null,
                  dayIdx === days.length - 1 ? 'rounded-br-lg' : null,
                  'p-1 min-h-[125px] hover:bg-gray-100 focus:z-10 relative no-underline'
                )}
              >
                <time
                  dateTime={day?.dateAsString}
                  className={classNames(
                    'mx-auto font-bold flex h-7 w-7 items-center justify-center rounded-full bg-purple-500 text-white'
                  )}
                >
                  {day?.dateAsString.split('/')[1]?.replace(/^0/, '')}
                </time>

                {day?.options.map((option) => (
                  <p className={'mb-0.5'}>{option}</p>
                ))}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
