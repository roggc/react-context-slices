import React,{ createContext, useContext } from "react";
import { useImmerReducer } from "use-immer";

export const _useStateContexts = [];
export const __useActions = [];
const _providers = [];
const useSuperStateContext = (slice, ...args) => {
  const useSuperCallback = (result, useStateContext) => ({
    ...result,
    ...(useStateContext(slice) || {}),
  });
  return args.reduce(useSuperCallback, {});
};

const useSuperActions = (...args) => {
  const useSuperCallback = (result, useActions) => ({
    ...result,
    ...useActions(),
  });
  return args.reduce(useSuperCallback, {});
};

export const createSlice = (reducer, initialState, name, _useActions) => {
  const stateContext = createContext();
  const dispatchContext = createContext();

  const useStateContext = (slice) =>
    useContext(slice === name ? stateContext : {});
  const useDispatchContext = () => useContext(dispatchContext);

  const ContextProvider = ({ children }) => {
    const [state, dispatch] = useImmerReducer(reducer, initialState);
    return (
      <stateContext.Provider value={state}>
        <dispatchContext.Provider value={dispatch}>
          {children}
        </dispatchContext.Provider>
      </stateContext.Provider>
    );
  };

  _useStateContexts.push(useStateContext);
  __useActions.push(_useActions(useDispatchContext));
  _providers.push(ContextProvider);
  return ContextProvider;
};

export const useValues = (slice) => {
  return useSuperStateContext(slice, ..._useStateContexts);
};

export const useActions = () => {
  return useSuperActions(...__useActions);
};

export const composeProviders = () => {
  const NeutralProvider = ({ children }) => children;
  return _providers.reduce(
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
