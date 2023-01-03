declare module "react-context-slices" {
  import { Immutable, Draft } from "immer";
  import { ImmerReducer } from "use-immer";

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

  export const createSlice: <S, A>(
    reducer: ImmerReducer<S, A>,
    initialState: S,
    name: string,
    getUseActions: (
      useDispatch: () => React.Dispatch<A>
    ) => () => UseActionsResult,
    localStorageKeys?: string[]
  ) => {
    useValues: (slice: string) => S | EmptyObject;
    useActions: () => UseActionsResult;
    Provider: ({ children }: React.PropsWithChildren) => JSX.Element;
  };
  export const composeProviders: () => ContextProviderType;
}
