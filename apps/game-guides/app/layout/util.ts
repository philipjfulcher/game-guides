export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export interface PropsWithChildren {
  children: JSX.Element | JSX.Element[]
}
