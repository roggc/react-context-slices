/// <reference path="./types/index.d.ts" />
import * as React from "react";

type AsyncStorageType = {
  getItem: (key: string) => Promise<string | null>;
} | null;

type ContextProviderType = ({
  children,
}: React.PropsWithChildren) => JSX.Element;

type UseActionsResult = {
  [x: string]: {
    [y: string]: (...args: any[]) => void;
  };
};

type GenericAction = { type: string; payload?: any };

type EmptyObject = {};

const createSlice = <S,>(
  reducer: React.Reducer<S, GenericAction>,
  initialState: S,
  name: string,
  getUseActions: (
    useDispatch: () => React.Dispatch<GenericAction>
  ) => () => UseActionsResult,
  localStorageKeys: string[] = [],
  AsyncStorage: AsyncStorageType = null
) => {
  const StateContext = React.createContext<S | EmptyObject>({});
  const DispatchContext = React.createContext<React.Dispatch<GenericAction>>(
    () => {}
  );

  const useStateContext = (slice: string) =>
    React.useContext(
      slice === name ? StateContext : ({} as React.Context<S | EmptyObject>)
    );
  const useDispatchContext = () => React.useContext(DispatchContext);

  const useValues = (slice: string): S | EmptyObject => {
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
      (reducer: any) => (state: any, action: GenericAction) => {
        if (action.type === __SET_INIT_PERSISTED_STATE_RN__) {
          Object.entries(action.payload).forEach(
            ([key, value]: [string, any]) => (state[key] = value)
          );
          return;
        }
        reducer(state, action);
      };
    const [state, dispatch] = React.useReducer<
      | React.Reducer<S, GenericAction>
      | ((state: any, action: GenericAction) => void)
    >(
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
      <StateContext.Provider value={state as S | EmptyObject}>
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

const composeProviders = (providers: ContextProviderType[]) => {
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

const createTypicalSlice = (
  name: string,
  data: any,
  isPersist: boolean = false,
  AsyncStorage: any = null
): {
  useValues: (slice: string) => {
    [key: string]: any;
  };
  useActions: () => UseActionsResult;
  Provider: ContextProviderType;
} => {
  const initialState = {
    [name]: data,
  };
  const SET = "SET";
  const reducer = (state: any, { type, payload }: GenericAction) => {
    switch (type) {
      case SET:
        return { ...state, [name]: payload };
      default:
        return state;
    }
  };
  const { useValues, useActions, Provider } = createSlice<{ [x: string]: any }>(
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
    },
    isPersist ? [name] : [],
    AsyncStorage
  );
  return { useValues, useActions, Provider };
};

const getHookAndProviderFromSlices = (
  slices: { [key: string]: any },
  persist: { [key: string]: boolean } = {},
  AsyncStorage: any = null
) => {
  const { useValues, useActions, providers } = Object.entries(slices)
    .map(([name, data]) =>
      createTypicalSlice(name, data, persist[name], AsyncStorage)
    )
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
        useValues: ((slice: string) => ({})) as (slice: string) => {
          [key: string]: any;
        },
        useActions: (() => ({})) as () => UseActionsResult,
        providers: [] as ContextProviderType[],
      }
    );
  const useSlice = (name: string) => {
    const { [name]: value } = useValues(name);
    const {
      [name]: { set },
    } = useActions();
    return [value, set];
  };
  return {
    useSlice,
    Provider: composeProviders(providers),
  };
};

export default getHookAndProviderFromSlices;
