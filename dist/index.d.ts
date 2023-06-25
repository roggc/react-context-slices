import * as React from "react";
import {
  Middleware,
  Dispatch as ReduxDispatch,
  AnyAction,
} from "@reduxjs/toolkit";
type ContextProviderType = ({
  children,
}: React.PropsWithChildren) => JSX.Element;
type Dispatch = (action?: any) => void;
type SliceCommon<T> = {
  reducer?: (state: T, action?: any) => T;
  isGetInitialStateFromStorage?: boolean;
  middleware?: ((
    dispatch: Dispatch
  ) => (next: Dispatch) => (action: any) => any)[];
};
type SliceWithoutInit<T> = {
  initialArg?: T;
} & SliceCommon<T>;
type SliceWithInit<T, K> = {
  initialArg?: K;
  init: (intialArg: K) => T;
} & SliceCommon<T>;
type NonUndefined<T> = T extends undefined ? never : T;
type Reducers<T> = {
  [x: string]: {
    (state: T, action: any): void | T;
  };
};
type ReduxSlice<T> = {
  initialState: NonUndefined<T>;
  reducers: Reducers<T>;
};
type Slice<T, K> = SliceWithInit<T, K> | SliceWithoutInit<T> | ReduxSlice<T>;
type SetValueCallback<T> = (v: T) => T;
type SetValue<T> = (value: T | SetValueCallback<T>) => void;
export function defineSlice<T>(slice: ReduxSlice<T>): ReduxSlice<T>;
export function defineSlice<T, K = T>(
  slice: SliceWithInit<T, K>
): SliceWithInit<T, K>;
export function defineSlice<T>(slice: SliceWithoutInit<T>): SliceWithoutInit<T>;
type MiddlewareArray = Middleware<any, any, ReduxDispatch<AnyAction>>[];
export type ReduxMiddleware = (store: {
  getState: () => any;
  dispatch: ReduxDispatch<AnyAction>;
}) => (next: ReduxDispatch<AnyAction>) => (action: AnyAction) => void;
declare const getHookAndProviderFromSlices: (config: {
  slices?: {
    [slice: string]: Slice<any, any>;
  };
  AsyncStorage?: any;
  reduxStoreOptions?: {
    middleware:
      | ((getDefaultMiddleware: any) => MiddlewareArray)
      | MiddlewareArray;
  };
}) => {
  useSlice: (<T, K = T>(
    slice: string,
    selector: (state: T) => K
  ) => [K, ReduxDispatch<AnyAction>, { [x: string]: any }]) &
    (<T, K = T>(
      slice: string
    ) => [
      K,
      SetValue<T> & Dispatch & ReduxDispatch<AnyAction>,
      { [x: string]: any }
    ]);
  Provider: ContextProviderType;
};
export default getHookAndProviderFromSlices;
