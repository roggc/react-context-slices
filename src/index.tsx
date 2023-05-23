/// <reference path="./types/index.d.ts" />
import * as rcs from "react-context-slices";
import * as React from "react";
import { ImmerReducer, useImmerReducer } from "use-immer";

type AsyncStorageType = {
  getItem: (key: string) => Promise<string | null>;
} | null;

export const createSlice = <S,>(
  reducer: ImmerReducer<S, rcs.A>,
  initialState: S,
  name: string,
  getUseActions: (
    useDispatch: () => React.Dispatch<rcs.A>
  ) => () => rcs.UseActionsResult,
  localStorageKeys: string[] = [],
  AsyncStorage: AsyncStorageType = null
) => {
  const StateContext = React.createContext<S | rcs.EmptyObject>({});
  const DispatchContext = React.createContext<React.Dispatch<rcs.A>>(() => {});

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

  if (!!localStorageKeys.length && !AsyncStorage) {
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

  const Provider = ({ children }: React.PropsWithChildren) => {
    const __SET_INIT_PERSISTED_STATE_RN__ = "__SET_INIT_PERSISTED_STATE_RN__";
    const reducerWrapper =
      (reducer: ImmerReducer<S, rcs.A>) => (draft: rcs.D<S>, action: rcs.A) => {
        if (action.type === __SET_INIT_PERSISTED_STATE_RN__) {
          Object.entries(action.payload).forEach(
            ([key, value]: [string, any]) => (draft[key] = value)
          );
          return;
        }
        reducer(draft, action);
      };
    const [state, dispatch] = useImmerReducer(
      !!AsyncStorage ? reducerWrapper(reducer) : reducer,
      initialState_ ?? initialState
    );

    React.useEffect(() => {
      if (!!localStorageKeys.length && !!AsyncStorage) {
        (async () => {
          let item: string | null | undefined = null;
          const updateState = {
            ...(await localStorageKeys.reduce(
              async (result, key) => ({
                ...(await result),
                // eslint-disable-next-line no-cond-assign
                ...(!!(item = await AsyncStorage?.getItem?.(key))
                  ? {
                      [key]: JSON.parse(item),
                    }
                  : {}),
              }),
              {}
            )),
          };

          return updateState;
        })().then((updateState) =>
          dispatch({
            type: __SET_INIT_PERSISTED_STATE_RN__,
            payload: updateState,
          })
        );
      }
    }, []);

    return (
      <StateContext.Provider value={state}>
        <DispatchContext.Provider value={dispatch}>
          {children}
        </DispatchContext.Provider>
      </StateContext.Provider>
    );
  };

  return {
    useValues,
    useActions,
    Provider,
  };
};

export const composeProviders = (providers: rcs.ContextProviderType[]) => {
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

export const createTypicalSlice = (
  name: string,
  data: any
): {
  useValues: (slice: string) =>
    | rcs.EmptyObject
    | {
        value: any;
      };
  useActions: () => rcs.UseActionsResult;
  Provider: rcs.ContextProviderType;
} => {
  const initialState = {
    value: data,
  };
  const SET = "SET";
  const reducer = (draft: rcs.D<any>, { type, payload }: rcs.A) => {
    switch (type) {
      case SET:
        draft.value = payload;
        break;
      default:
        break;
    }
  };
  const { useValues, useActions, Provider } = createSlice(
    reducer,
    initialState,
    name,
    (useDispatch) => () => {
      const dispatch = useDispatch();
      const set = React.useCallback(
        (value: any) => dispatch({ type: SET, payload: value }),
        [dispatch]
      );
      return { [name]: { set } };
    }
  );
  return { useValues, useActions, Provider };
};

export const getHooksAndProviderFromSlices = (slices: any) => {
  const { useValues, useActions, providers } = Object.entries(slices)
    .map(([name, data]) => createTypicalSlice(name, data))
    .reduce(
      (res, values) => ({
        useValues: (slice: string) => ({
          ...res.useValues(slice),
          ...values.useValues(slice),
        }),
        useActions: () => ({ ...res.useActions(), ...values.useActions() }),
        providers: [...res.providers, values.Provider],
      }),
      {
        useValues: ((slice: string) => ({})) as (slice: string) =>
          | rcs.EmptyObject
          | {
              value: any;
            },
        useActions: (() => ({})) as () => rcs.UseActionsResult,
        providers: [] as rcs.ContextProviderType[],
      }
    );

  return { useValues, useActions, Provider: composeProviders(providers) };
};
