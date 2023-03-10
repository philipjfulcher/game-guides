import { PropsWithChildren } from './util';

export interface ShellProps extends PropsWithChildren {}
export default function Shell({ children }: ShellProps) {
  return (
    <>
      {/* Background color split screen for large screens */}
      <div
        className="fixed top-0 left-0 h-full w-1/2 bg-white"
        aria-hidden="true"
      />
      <div
        className="fixed top-0 right-0 h-full w-1/2 bg-gray-50"
        aria-hidden="true"
      />
      <div className="relative flex min-h-screen flex-col">{children}</div>
    </>
  );
}
