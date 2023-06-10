import * as React from "react";
type ContextProviderType = ({
  children,
}: React.PropsWithChildren) => JSX.Element;
type Dispatch = (action?: any) => void;
type SliceWithoutInit<T, K> = {
  initialArg?: T;
  reducer?: (state: T, action?: any) => T;
  isGetInitialStateFromStorage?: boolean;
  middleware?: ((
    dispatch: Dispatch
  ) => (next: Dispatch) => (action: any) => any)[];
};
type SliceWithInit<T, K> = {
  initialArg?: K;
  init: (intialArg: K) => T;
  reducer?: (state: T, action?: any) => T;
  isGetInitialStateFromStorage?: boolean;
  middleware?: ((
    dispatch: Dispatch
  ) => (next: Dispatch) => (action: any) => any)[];
};
type Slice<T, K> = SliceWithInit<T, K> | SliceWithoutInit<T, K>;
type SetValueCallback<T> = (v: T) => T;
type SetValue<T> = (value: T | SetValueCallback<T>) => void;
export function defineSlice<T, K = T>(
  slice: SliceWithInit<T, K>
): SliceWithInit<T, K>;
export function defineSlice<T, K = T>(
  slice: SliceWithoutInit<T, K>
): SliceWithoutInit<T, K>;
declare const getHookAndProviderFromSlices: (
  slices?: {
    [slice: string]: Slice<any, any>;
  },
  AsyncStorage?: any
) => {
  useSlice: <T>(slice: string) => [T, SetValue<T> & Dispatch];
  Provider: ContextProviderType;
};
export default getHookAndProviderFromSlices;
