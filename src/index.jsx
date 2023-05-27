import * as React from "react";

const createSlice = (
  reducer,
  initialState,
  name,
  getUseActions,
  localStorageKeys,
  AsyncStorage = null
) => {
  const StateContext = React.createContext({});
  const DispatchContext = React.createContext(() => {});

  const useStateContext = (slice) =>
    React.useContext(slice === name ? StateContext : {});
  const useDispatchContext = () => React.useContext(DispatchContext);

  const useValues = (slice) => {
    const state = useStateContext(slice);
    return state ?? {};
  };

  const useActions = getUseActions(useDispatchContext);

  let initialState_ = undefined;

  if (!!localStorageKeys.length && !AsyncStorage) {
    let item = null;
    initialState_ = {
      ...initialState,
      ...localStorageKeys.reduce(
        (result, key) => ({
          ...result,
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

  const Provider = ({ children }) => {
    const __SET_INIT_PERSISTED_STATE_RN__ = "__SET_INIT_PERSISTED_STATE_RN__";
    const reducerWrapper = (reducer) => (state, action) => {
      if (action.type === __SET_INIT_PERSISTED_STATE_RN__) {
        Object.entries(action.payload).forEach(
          ([key, value]) => (state[key] = value)
        );
        return;
      }
      reducer(state, action);
    };
    const [state, dispatch] = React.useReducer(
      !!AsyncStorage ? reducerWrapper(reducer) : reducer,
      initialState_ ?? initialState
    );

    React.useEffect(() => {
      if (!!localStorageKeys.length && !!AsyncStorage) {
        (async () => {
          let item = null;
          const updateState = {
            ...(await localStorageKeys.reduce(
              async (result, key) => ({
                ...(await result),
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

const composeProviders = (providers) => {
  const NeutralProvider = ({ children }) => <>{children}</>;
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
  name,
  data,
  isPersist = false,
  AsyncStorage = null
) => {
  const initialState = {
    [name]: data,
  };
  const SET = "SET";
  const reducer = (state, { type, payload }) => {
    switch (type) {
      case SET:
        return typeof payload === "function"
          ? { ...state, [name]: payload(state[name]) }
          : { ...state, [name]: payload };
      default:
        return state;
    }
  };
  const { useValues, useActions, Provider } = createSlice(
    reducer,
    initialState,
    name,
    (useDispatch) => () => {
      const dispatch = useDispatch();
      const set = React.useCallback(
        (value) => dispatch({ type: SET, payload: value }),
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
  slices,
  persist = {},
  AsyncStorage = null
) => {
  const { useValues, useActions, providers } = Object.entries(slices)
    .map(([name, data]) =>
      createTypicalSlice(name, data, persist[name], AsyncStorage)
    )
    .reduce(
      (res, values) => ({
        useValues: (slice) => ({
          ...res.useValues(slice),
          ...values.useValues(slice),
        }),
        useActions: () => ({ ...res.useActions(), ...values.useActions() }),
        providers: [...res.providers, values.Provider],
      }),
      {
        useValues: (slice) => ({}),
        useActions: () => ({}),
        providers: [],
      }
    );
  const useSlice = (name) => {
    const { [name]: value } = useValues(name);
    const {
      [name]: { set },
    } = useActions();
    return [value, set];
  };
  const Provider = composeProviders(providers);
  return {
    useSlice,
    Provider,
  };
};

export default getHookAndProviderFromSlices;
