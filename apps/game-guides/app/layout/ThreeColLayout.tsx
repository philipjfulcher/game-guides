import { PropsWithChildren } from "./util";

export interface ThreeColLayoutProps {
  children: [JSX.Element, JSX.Element, JSX.Element];
}

export function ThreeColLayout({ children }: ThreeColLayoutProps) {


  return <div className="mx-auto w-full max-w-7xl flex-grow lg:flex xl:px-8">
    {/* Left sidebar & main wrapper */}
    <div className="min-w-0 flex-1 bg-white xl:flex">
      <div
        className="border-b border-gray-200 bg-white xl:w-64 xl:flex-shrink-0 xl:border-b-0 xl:border-r xl:border-gray-200">
        <div className="h-full py-6 pl-4 pr-6 sm:pl-6 lg:pl-8 xl:pl-0">
          {children[0]}
        </div>
      </div>

      <div className="bg-white lg:min-w-0 lg:flex-1">
        <div className="h-full py-6 px-4 sm:px-6 lg:px-8">
          {children[1]}
        </div>
      </div>
    </div>

    <div className="bg-gray-50 pr-4 sm:pr-6 lg:flex-shrink-0 lg:border-l lg:border-gray-200 lg:pr-8 xl:pr-0">
      <div className="h-full py-6 pl-6 lg:w-80">
        {children[2]}
      </div>
    </div>
  </div>;
}
