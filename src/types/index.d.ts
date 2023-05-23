declare module "react-context-slices" {
  export type ContextProviderType = ({
    children,
  }: React.PropsWithChildren) => JSX.Element;

  export type UseActionsResult = {
    [x: string]: {
      [y: string]: (...args: any[]) => void;
    };
  };

  export type GenericAction = { type: string; payload?: any };
  export type GenericDraft<S> = Draft<Immutable<S>>;
  export type UseDispatch = () => React.Dispatch<GenericAction>;
  export type EmptyObject = {};
  export type D<S> = GenericDraft<S>;
  export type A = GenericAction;
  export type AsyncStorageType = {
    getItem: (key: string) => Promise<string | null>;
  } | null;
  export declare const createSlice: <S>(
    reducer: ImmerReducer<S, rcs.GenericAction>,
    initialState: S,
    name: string,
    getUseActions: (
      useDispatch: () => React.Dispatch<rcs.A>
    ) => () => rcs.UseActionsResult,
    localStorageKeys?: string[],
    AsyncStorage?: AsyncStorageType
  ) => {
    useValues: (slice: string) => S | rcs.EmptyObject;
    useActions: () => rcs.UseActionsResult;
    Provider: ({ children }: React.PropsWithChildren) => JSX.Element;
  };
  export declare const composeProviders: (
    providers: rcs.ContextProviderType[]
  ) => rcs.ContextProviderType;
  export declare const createTypicalSlice: (
    name: string,
    data: any,
    isPersist?: boolean,
    AsyncStorage?: any
  ) => {
    useValues: (slice: string) => {
      [key: string]: any;
    };
    useActions: () => rcs.UseActionsResult;
    Provider: rcs.ContextProviderType;
  };
  export declare const getHooksAndProviderFromSlices: (
    slices: {
      [key: string]: any;
    },
    persist?: {
      [key: string]: boolean;
    },
    AsyncStorage?: any
  ) => {
    useValues: (slice: string) => {
      [key: string]: any;
    };
    useActions: () => rcs.UseActionsResult;
    useSlice: (name: string) => any[];
    Provider: rcs.ContextProviderType;
  };
}
