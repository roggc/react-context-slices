/// <reference path = "./index.d.ts" />
import * as rcs from "react-context-slices";
import * as React from "react";
import { useImmerReducer, ImmerReducer } from "use-immer";

const providers: rcs.ContextProviderType[] = [];

export const createSlice = <S, A>(
  reducer: ImmerReducer<S, A>,
  initialState: S,
  name: string,
  getUseActions: (
    useDispatch: () => React.Dispatch<A>
  ) => () => rcs.UseActionsResult,
  localStorageKeys: string[] = []
) => {
  const StateContext = React.createContext<S | rcs.EmptyObject>({});
  const DispatchContext = React.createContext<React.Dispatch<A>>(() => {});

  const useStateContext = (slice: string) =>
    React.useContext(
      slice === name ? StateContext : ({} as React.Context<S | rcs.EmptyObject>)
    );
  const useDispatchContext = () => React.useContext(DispatchContext);

  const useValues = (slice: string): S | rcs.EmptyObject => {
    const state = useStateContext(slice);
    return state ?? {};
  };

  const useActions = getUseActions(useDispatchContext);

  const Provider = ({ children }: React.PropsWithChildren) => {
    let initialState_: S | undefined = undefined;
    if (!!localStorageKeys.length) {
      let item: string | null = null;
      initialState_ = {
        ...initialState,
        ...localStorageKeys.reduce(
          (result, key) => ({
            ...result,
            // eslint-disable-next-line no-cond-assign
            ...((item = localStorage.getItem(key))
              ? { [key]: JSON.parse(item) }
              : {}),
          }),
          {}
        ),
      };
    }
    const [state, dispatch] = useImmerReducer(
      reducer,
      initialState_ ?? initialState
    );
    return (
      <StateContext.Provider value={state}>
        <DispatchContext.Provider value={dispatch}>
          {children}
        </DispatchContext.Provider>
      </StateContext.Provider>
    );
  };

  providers.push(Provider);

  return {
    useValues,
    useActions,
    Provider,
  };
};

export const composeProviders = () => {
  const NeutralProvider = ({ children }: React.PropsWithChildren) => (
    <>{children}</>
  );
  return providers.reduce(
    (AccProvider, Provider) =>
      ({ children }) =>
        (
          <Provider>
            <AccProvider>{children}</AccProvider>
          </Provider>
        ),
    NeutralProvider
  );
};
