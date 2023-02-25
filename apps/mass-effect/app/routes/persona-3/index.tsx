import { Fragment } from "react";
import {
  MoonIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  CheckIcon
} from "@heroicons/react/24/solid";
import { Menu, Transition } from "@headlessui/react";
import {
  addDays,
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfMonth, endOfWeek,
  format,
  isSameDay,
  startOfMonth,
  startOfWeek,
  subDays
} from "date-fns";

const start = new Date("2009-04-07");
const end = new Date("2010-01-31");
// repalce this with real today when ready
const today = new Date("2023-04-21");

const months = eachMonthOfInterval({ start, end }).map(month => {

  const lastDayOfMonth = endOfMonth(month);
  const firstDayOfWeekOfMonth = startOfWeek(month, { weekStartsOn: 1 });
  const lastDayOfWeekOfMonth = endOfWeek(lastDayOfMonth, { weekStartsOn: 1 });

  //first get days in month
  let days = eachDayOfInterval({ start: month, end: lastDayOfMonth }).map(day => ({
    date: format(day, "yyyy-MM-dd"),
    isCurrentMonth: true,
    isToday: today.getDate() === day.getDate() && today.getMonth() === day.getMonth(),
    isComplete: true
  }));

  if (!isSameDay(month, firstDayOfWeekOfMonth)) {
    // get the rest of the week before month start
    days = eachDayOfInterval({
      start: firstDayOfWeekOfMonth,
      end: subDays(month, 1)
    }).map(day => ({
      date: format(day, "yyyy-MM-dd"),
      isCurrentMonth: false,
      isToday: false,
      isComplete: false
    })).concat(days);
  }

  if (!isSameDay(lastDayOfMonth, lastDayOfWeekOfMonth)) {
    //get the rest of the week after month end
    days = days.concat(eachDayOfInterval({
      start: addDays(lastDayOfMonth, 1),
      end: lastDayOfWeekOfMonth
    }).map(day => ({ date: format(day, "yyyy-MM-dd"), isCurrentMonth: false, isToday: false, isComplete: false })));
  }


  return {
    name: format(month, "LLLL yyyy"),
    days
  };
});


function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Example() {
  return (
    <div>
      <header className="flex items-center justify-between border-b border-gray-200 py-4 px-6">
        <h1 className="text-lg font-semibold text-gray-900">
          <time dateTime="2022">2022</time>
        </h1>
        <div className="flex items-center">
          <div className="flex items-center rounded-md shadow-sm md:items-stretch">
            <button
              type="button"
              className="flex items-center justify-center rounded-l-md border border-r-0 border-gray-300 bg-white py-2 pl-3 pr-4 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:px-2 md:hover:bg-gray-50"
            >
              <span className="sr-only">Previous month</span>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="hidden border-t border-b border-gray-300 bg-white px-3.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:relative md:block"
            >
              Today
            </button>
            <span className="relative -mx-px h-5 w-px bg-gray-300 md:hidden" />
            <button
              type="button"
              className="flex items-center justify-center rounded-r-md border border-l-0 border-gray-300 bg-white py-2 pl-4 pr-3 text-gray-400 hover:text-gray-500 focus:relative md:w-9 md:px-2 md:hover:bg-gray-50"
            >
              <span className="sr-only">Next month</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="hidden md:ml-4 md:flex md:items-center">
            <Menu as="div" className="relative">
              <Menu.Button
                type="button"
                className="flex items-center rounded-md border border-gray-300 bg-white py-2 pl-3 pr-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Year view
                <ChevronDownIcon className="ml-2 h-5 w-5 text-gray-400" aria-hidden="true" />
              </Menu.Button>

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
                  className="absolute right-0 z-10 mt-3 w-36 origin-top-right overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                            "block px-4 py-2 text-sm"
                          )}
                        >
                          Day view
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                            "block px-4 py-2 text-sm"
                          )}
                        >
                          Week view
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                            "block px-4 py-2 text-sm"
                          )}
                        >
                          Month view
                        </a>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          href="#"
                          className={classNames(
                            active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                            "block px-4 py-2 text-sm"
                          )}
                        >
                          Year view
                        </a>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
            <div className="ml-6 h-6 w-px bg-gray-300" />
            <button
              type="button"
              className="ml-6 rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Add event
            </button>
          </div>
          <Menu as="div" className="relative ml-6 md:hidden">
            <Menu.Button
              className="-mx-2 flex items-center rounded-full border border-transparent p-2 text-gray-400 hover:text-gray-500">
              <span className="sr-only">Open menu</span>
              <EllipsisHorizontalIcon className="h-5 w-5" aria-hidden="true" />
            </Menu.Button>

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
                className="absolute right-0 z-10 mt-3 w-36 origin-top-right divide-y divide-gray-100 overflow-hidden rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                          "block px-4 py-2 text-sm"
                        )}
                      >
                        Create event
                      </a>
                    )}
                  </Menu.Item>
                </div>
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                          "block px-4 py-2 text-sm"
                        )}
                      >
                        Go to today
                      </a>
                    )}
                  </Menu.Item>
                </div>
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                          "block px-4 py-2 text-sm"
                        )}
                      >
                        Day view
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                          "block px-4 py-2 text-sm"
                        )}
                      >
                        Week view
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                          "block px-4 py-2 text-sm"
                        )}
                      >
                        Month view
                      </a>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="#"
                        className={classNames(
                          active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                          "block px-4 py-2 text-sm"
                        )}
                      >
                        Year view
                      </a>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </header>

      <div className={"flex flex-column"}>
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
                  {month.days.map((day, dayIdx) => (
                    <button
                      key={day.date}
                      type="button"
                      className={classNames(
                        day.isCurrentMonth ? "bg-white text-gray-900" : "bg-gray-50 text-gray-400",
                        dayIdx === 0 && "rounded-tl-lg",
                        dayIdx === 6 && "rounded-tr-lg",
                        dayIdx === month.days.length - 7 && "rounded-bl-lg",
                        dayIdx === month.days.length - 1 && "rounded-br-lg",
                        "py-1.5 hover:bg-gray-100 focus:z-10 relative"
                      )}
                    >
                      <time
                        dateTime={day.date}
                        className={classNames(
                          day.isToday && "bg-indigo-600 font-semibold text-white",
                          "mx-auto flex h-7 w-7 items-center justify-center rounded-full"
                        )}
                      >
                        {day.date.split("-").pop().replace(/^0/, "")}
                      </time>
                      {day.date === "2009-04-20" ? <MoonIcon
                        className={"absolute h-4 w-4 top-0 right-0 text-cyan-500"}></MoonIcon> : null}

                      {day.isComplete ?
                        <CheckIcon className={"absolute h-4 w-4 top-0 right-0 text-green-500"}></CheckIcon> : null}
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
        <div className={"basis-1/3"}>detail area</div>
      </div>
    </div>
  );
}

