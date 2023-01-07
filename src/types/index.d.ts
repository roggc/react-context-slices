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
  export type StorageType = {
    getItem: (key: string) => Promise<string | null>;
  } | null;
  export const createSlice: <S, A>(
    reducer: ImmerReducer<S, A>,
    initialState: S,
    name: string,
    getUseActions: (
      useDispatch: () => React.Dispatch<A>
    ) => () => rcs.UseActionsResult,
    localStorageKeys?: string[],
    AsyncStorage?: StorageType
  ) => {
    useValues: (slice: string) => S | rcs.EmptyObject;
    useActions: () => rcs.UseActionsResult;
    Provider: ({ children }: React.PropsWithChildren) => JSX.Element;
  };
  export const composeProviders: () => rcs.ContextProviderType;
}
