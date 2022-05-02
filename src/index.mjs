import React,{ createContext, useContext } from "react";
import { useImmerReducer } from "use-immer";

export const _useStateContexts = [];
export const __useActions = [];
const _providers = [];

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
  const useSuperCallback = (result, useStateContext) => ({
    ...result,
    ...(useStateContext(slice) || {}),
  });
  return _useStateContexts.reduce(useSuperCallback, {});
};

export const useActions = () => {
  const useSuperCallback = (result, useActions_) => ({
    ...result,
    ...useActions_(),
  });
  return __useActions.reduce(useSuperCallback, {});
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
