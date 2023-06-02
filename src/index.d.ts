import * as React from "react";
type ContextProviderType = ({
  children,
}: React.PropsWithChildren) => JSX.Element;
type Slice<T> = {
  initialArg?: any;
  init?: (intialArg: any) => T;
  reducer?: (state: T, action?: any) => T;
  isGetInitialStateFromStorage?: boolean;
};
type SetValueCallback<T> = (v: T) => T;
type SetValue<T> = (value: T | SetValueCallback<T>) => void;
type Dispatch = (action?: any) => void;
export function defineSlice<T>(slice: Slice<T>): Slice<T>;
declare const getHookAndProviderFromSlices: (
  slices: {
    [slice: string]: Slice<any>;
  },
  AsyncStorage?: any
) => {
  useSlice: <T>(slice: string) => [T, SetValue<T> & Dispatch];
  Provider: ContextProviderType;
};
export default getHookAndProviderFromSlices;
