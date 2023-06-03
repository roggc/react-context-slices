import * as React from "react";
type ContextProviderType = ({
  children,
}: React.PropsWithChildren) => JSX.Element;
type Slice<T, K = T> = {
  initialArg?: K;
  init?: (intialArg: K) => T;
  reducer?: (state: T, action?: any) => T;
  isGetInitialStateFromStorage?: boolean;
};
type SetValueCallback<T> = (v: T) => T;
type SetValue<T> = (value: T | SetValueCallback<T>) => void;
type Dispatch = (action?: any) => void;
export function defineSlice<T, K = T>(slice: Slice<T, K>): Slice<T, K>;
declare const getHookAndProviderFromSlices: (
  slices: {
    [slice: string]: Slice<any, any>;
  },
  AsyncStorage?: any
) => {
  useSlice: <T>(slice: string) => [T, SetValue<T> & Dispatch];
  Provider: ContextProviderType;
};
export default getHookAndProviderFromSlices;
