import * as React from "react";

const __SET_INIT_PERSISTED_STATE_RN__ = "__SET_INIT_PERSISTED_STATE_RN__";

const createSlice = (
  reducer,
  initialState,
  name,
  getUseActions,
  isCustomReducer,
  isGetInitialStateFromStorage,
  AsyncStorage
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

  let initialState_;

  if (isGetInitialStateFromStorage && !AsyncStorage) {
    let item;
    !!(item = localStorage.getItem(name)) &&
      (initialState_ = isCustomReducer
        ? JSON.parse(item)
        : { [name]: JSON.parse(item) });
  }

  const Provider = ({ children }) => {
    const reducerWrapper = (reducer) => (state, action) =>
      !!action && action.type === __SET_INIT_PERSISTED_STATE_RN__
        ? isCustomReducer
          ? reducer(action.payload, action)
          : reducer(
              Object.entries(action.payload).reduce(
                (res, [key, value]) => ({ ...res, [key]: value }),
                state
              ),
              action
            )
        : reducer(state, action);

    const [state, dispatch] = React.useReducer(
      !!AsyncStorage ? reducerWrapper(reducer) : reducer,
      initialState_ !== undefined ? initialState_ : initialState
    );

    React.useEffect(() => {
      if (isGetInitialStateFromStorage && !!AsyncStorage) {
        (async () => {
          let item;
          let updateState;
          !!(item = await AsyncStorage?.getItem?.(name)) &&
            (updateState = isCustomReducer
              ? JSON.parse(item)
              : { [name]: JSON.parse(item) });
          return updateState;
        })().then(
          (updateState) =>
            !!updateState &&
            dispatch({
              type: __SET_INIT_PERSISTED_STATE_RN__,
              payload: updateState,
            })
        );
      }
    }, []);

    return (
      <StateContext.Provider
        value={isCustomReducer ? { [name]: state } : state}
      >
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
  reducer_,
  isGetInitialStateFromStorage,
  AsyncStorage
) => {
  const initialState = !!reducer_
    ? data
    : {
        [name]: data,
      };
  const SET = "SET";
  const reducer =
    reducer_ ??
    ((state, { type, payload }) => {
      switch (type) {
        case SET:
          return typeof payload === "function"
            ? { ...state, [name]: payload(state[name]) }
            : { ...state, [name]: payload };
        default:
          return state;
      }
    });
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
      return !!reducer_ ? { [name]: { dispatch } } : { [name]: { set } };
    },
    !!reducer_,
    isGetInitialStateFromStorage,
    AsyncStorage
  );
  return { useValues, useActions, Provider };
};

const getHookAndProviderFromSlices = (slices, AsyncStorage) => {
  const { useValues, useActions, providers } = Object.entries(slices)
    .map(([name, { initialState, reducer, isGetInitialStateFromStorage }]) =>
      createTypicalSlice(
        name,
        initialState,
        reducer,
        !!isGetInitialStateFromStorage,
        AsyncStorage
      )
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
    const { [name]: actions } = useActions();
    return [value, !!slices[name]?.reducer ? actions.dispatch : actions.set];
  };
  const Provider = composeProviders(providers);
  return {
    useSlice,
    Provider,
  };
};

export const defineSlice = (slice) => slice;

export default getHookAndProviderFromSlices;
