type Join<K, P> = K extends string | number ?
  P extends string | number ?
  `${K}${'' extends P ? '' : '.'}${P}`
  : never : never;

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16, 17, 18, 19, 20, ...0[]];

/**
  * @description A type function that can be used to get all of the extremity paths
  * into an object `A`.
  *
  * This type helper may also receive a second type parameter called `TypeOfValueAtLeaf`.
  * This parameter can be used to filter only the 
  * leafs for which the value *extends* `TypeOfValueAtLeaf`.
  *
  * @example
  * ```ts
  * type MyObj = {
  *   foo: { bar: string };
  *   strider: string;
  *   super: boolean;
  *   role: string;
  *   number: number;
  * }
  *
  * type Test = LeavesOfObject<MyObj>;
  * // type Test = "number" | "strider" | "super" | "role" | "foo.bar"
  *
  * type TestFiltered = LeavesOfObject<MyObj, string>;
  * // type TestFiltered = "strider" | "role" | "foo.bar"
  * ```
  */
export type LeavesOfObject<
A, 
TypeOfValueAtLeaf = any, 
D extends number = 5, 
T extends Required<A> = Required<A>
> = [D] extends [never] ? never : T extends object ?
  T extends Date ? '' : { 
  [K in keyof T]-?: Join<
    K, 
    LeavesOfObject<T[K], TypeOfValueAtLeaf, Prev[D]> extends '' 
      ? (T[K] extends TypeOfValueAtLeaf ? '' : never)
      : LeavesOfObject<T[K], TypeOfValueAtLeaf, Prev[D]>
  >
}[keyof T] : '';

export type ArrLeavesOfObject<A, D extends number = 5, T extends Required<A> = Required<A>> = [D] extends [never] ? never : T extends object ?
  T extends Date ? [] : { [K in keyof T]-?: [K, ...ArrLeavesOfObject<T[K], Prev[D]>] }[keyof T] : [];