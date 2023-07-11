import { Split } from './Split';

type RemoveFirst<T extends unknown[]> = T extends [] ? [] : 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  T extends [infer _First, ...infer Rest] 
    ? Rest
    : T;

type DeepGetPathArr<A, Path extends string[], T extends Required<A> = Required<A>> 
  = Path[0] extends keyof T 
    ? T[Path[0]] extends object 
      ? T[Path[0]] extends Date ? T[Path[0]] : 
        DeepGetPathArr<T[Path[0]], RemoveFirst<Path>>
      : T[Path[0]]
    : never;

export type DeepGet<T extends object, Path>
  = Path extends string ? DeepGetPathArr<T, Split<Path, '.'>> : never;
