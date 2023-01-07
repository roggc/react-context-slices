/// <reference path="./types/index.d.ts" />
import * as rcs from "react-context-slices";
import * as React from "react";
import { ImmerReducer, useImmerReducer } from "use-immer";

const providers: rcs.ContextProviderType[] = [];

type StorageType = {
  getItem: (key: string) => Promise<string | null>;
} | null;

export const createSlice = <S, A>(
  reducer: ImmerReducer<S, A>,
  initialState: S,
  name: string,
  getUseActions: (
    useDispatch: () => React.Dispatch<A>
  ) => () => rcs.UseActionsResult,
  localStorageKeys: string[] = [],
  AsyncStorage: StorageType = null
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

  let initialState_: S | undefined = undefined;

  !!AsyncStorage
    ? (async () => {
        if (!!localStorageKeys.length) {
          let item: string | null = null;
          initialState_ = {
            ...initialState,
            ...(await localStorageKeys.reduce(
              async (result, key) => ({
                ...(await result),
                // eslint-disable-next-line no-cond-assign
                ...(!!(item = await AsyncStorage.getItem?.(key))
                  ? {
                      [key]: JSON.parse(item),
                    }
                  : {}),
              }),
              {}
            )),
          };
        }
        return initialState_ ?? initialState;
      })()
    : (() => {
        if (!!localStorageKeys.length) {
          let item: string | null = null;
          initialState_ = {
            ...initialState,
            ...localStorageKeys.reduce(
              (result, key) => ({
                ...result,
                // eslint-disable-next-line no-cond-assign
                ...(!!(item = localStorage.getItem(key))
                  ? {
                      [key]: JSON.parse(item),
                    }
                  : {}),
              }),
              {}
            ),
          };
        }
      })();

  const Provider = ({ children }: React.PropsWithChildren) => {
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
