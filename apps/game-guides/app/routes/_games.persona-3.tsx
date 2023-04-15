import {CheckIcon, ClockIcon,} from '@heroicons/react/24/solid';
import {
  addDays,
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  startOfWeek,
  subDays,
} from 'date-fns';
import {Link, Outlet, useLoaderData, useParams} from '@remix-run/react';
import {json, LoaderArgs} from '@remix-run/node';
import {createSupabaseServerClient, Database, getDate,} from '@game-guides/data-access';
import {SupabaseClient} from '@supabase/auth-helpers-remix';
import {Fragment} from "react";

interface DayData {
  date: string;
  isCurrentMonth: boolean;
  isTartarusDay: boolean;
  isToday: boolean;
  isComplete: boolean;
  hasData: boolean;
}

interface MonthData {
  name: string;
  days: DayData[]
}

async function getMonths(supabase: SupabaseClient<Database>) {
  const completedDays = await supabase
    .from('completed_steps')
    .select('*')
    .eq('game_id', 'persona-3');

  const start = new Date('2009-04-07');
  const end = new Date('2010-01-31');
  const today = new Date();

  const months = eachMonthOfInterval({start, end});
  let monthsData: MonthData[] = [];

  for (let month of months) {
    const lastDayOfMonth = endOfMonth(month);
    const firstDayOfWeekOfMonth = startOfWeek(month, {weekStartsOn: 1});
    const lastDayOfWeekOfMonth = endOfWeek(lastDayOfMonth, {weekStartsOn: 1});

    //first get days in month
    let days = eachDayOfInterval({start: month, end: lastDayOfMonth});
    let dayData: DayData[] = [];

    for (let day of days) {
      const formattedDate = format(day, 'yyyy-MM-dd');
      const dateData = await getDate(formattedDate);

      if (dateData) {
        dayData.push({
          date: format(day, 'yyyy-MM-dd'),
          isCurrentMonth: true,
          isTartarusDay: dateData?.nightTime.activity === 'Tartarus',
          isToday:
            today.getDate() === day.getDate() &&
            today.getMonth() === day.getMonth(),
          isComplete:
            Boolean(completedDays.data?.find(
              (completedDay) =>
                completedDay.step_id === format(day, 'yyyy-MM-dd')
            )),
          hasData: true
        });
      } else {
        dayData.push({
          date: format(day, 'yyyy-MM-dd'),
          isCurrentMonth: true,
          isTartarusDay: false,
          isToday:
            today.getDate() === day.getDate() &&
            today.getMonth() === day.getMonth(),
          isComplete: false,
          hasData: false
        });
      }
    }

    if (!isSameDay(month, firstDayOfWeekOfMonth)) {
      // get the rest of the week before month start
      dayData = eachDayOfInterval({
        start: firstDayOfWeekOfMonth,
        end: subDays(month, 1),
      })
        .map((day) => ({
          date: format(day, 'yyyy-MM-dd'),
          isTartarusDay: false,
          isCurrentMonth: false,
          isToday: false,
          isComplete: false,
          hasData: false
        }))
        .concat(dayData);
    }

    if (!isSameDay(lastDayOfMonth, lastDayOfWeekOfMonth)) {
      //get the rest of the week after month end
      dayData = dayData.concat(
        eachDayOfInterval({
          start: addDays(lastDayOfMonth, 1),
          end: lastDayOfWeekOfMonth,
        }).map((day) => ({
          date: format(day, 'yyyy-MM-dd'),
          isCurrentMonth: false,
          isTartarusDay: false,
          isToday: false,
          isComplete: false,
          hasData: false
        }))
      );
    }

    monthsData.push({
      name: format(month, 'LLLL yyyy'),
      days: dayData,
    });
  }

  return monthsData;
}

export const loader = async ({request}: LoaderArgs) => {
  const response = new Response();
  const supabase = createSupabaseServerClient({request, response});

  const months = await getMonths(supabase);
  return json({months});
};

function classNames(...classes: Array<string | null>) {
  return classes.filter(Boolean).join(' ');
}

export default function Calendar() {
  const {months} = useLoaderData<typeof loader>();
  const {month,day,year} = useParams();
  const selectedDate = `${year}-${month}-${day}`;
  return (
    <div>
      <div className={'flex flex-column'}>
        <div className="basis-2/3 bg-white">
          <div
            className="mx-auto grid max-w-3xl grid-cols-1 gap-x-8 gap-y-16 px-4 py-16 sm:grid-cols-2 sm:px-6 xl:max-w-none xl:grid-cols-3 xl:px-8 2xl:grid-cols-4">
            {months.map((month) => (
              <section key={month.name} className="text-center">
                <h2 className="font-semibold text-gray-900">{month.name}</h2>
                <div className="mt-6 grid grid-cols-7 text-xs leading-6 text-gray-500">
                  <div>M</div>
                  <div>T</div>
                  <div>W</div>
                  <div>T</div>
                  <div>F</div>
                  <div>S</div>
                  <div>S</div>
                </div>
                <div
                  className="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-sm shadow ring-1 ring-gray-200">
                  {month.days.map((day, dayIdx) => {
                    const DayElement = day.isCurrentMonth && day.hasData ? Link : ({children,className}) => <div className={className}>{children}</div>;

                    return <DayElement
                      key={day.date}
                      to={`/persona-3/${day.date.replaceAll('-', '/')}`}
                      type="button"
                      className={classNames(
                        day.isCurrentMonth && day.hasData
                          ? 'bg-white text-gray-900'
                          : 'bg-gray-50 text-gray-400',
                        dayIdx === 0 ? 'rounded-tl-lg' : null,
                        dayIdx === 6 ? 'rounded-tr-lg' : null,
                        dayIdx === month.days.length - 7
                          ? 'rounded-bl-lg'
                          : null,
                        dayIdx === month.days.length - 1
                          ? 'rounded-br-lg'
                          : null,
                        day.date === selectedDate ? 'ring-1 ring-cyan-500' : null,
                        'py-1.5 hover:bg-gray-100 focus:z-10 relative no-underline'
                      )}
                    >
                      <time
                        dateTime={day.date}
                        className={classNames(
                          day.isToday
                            ? 'bg-indigo-600 font-semibold text-white'
                            : null,
                          'mx-auto flex h-7 w-7 items-center justify-center rounded-full'
                        )}
                      >
                        {day.date.split('-').pop()?.replace(/^0/, '')}
                      </time>
                      {day.isTartarusDay ? (
                        <ClockIcon
                          className={
                            'absolute h-4 w-4 top-0 right-0 text-cyan-500'
                          }
                        ></ClockIcon>
                      ) : null}

                      {day.isComplete ? (
                        <CheckIcon
                          className={
                            'absolute h-4 w-4 top-0 right-0 text-green-500'
                          }
                        ></CheckIcon>
                      ) : null}
                    </DayElement>
                  }
                  )}
          </div>
        </section>
        ))}
      </div>
    </div>
  <div className={'basis-1/3'}>
    <Outlet></Outlet>
  </div>
</div>
</div>
)
  ;
}
