import React, { createContext, useContext } from "react";
import { useImmerReducer } from "use-immer";

const providers = [];

export const createSlice = (reducer, initialState, name, getUseActions) => {
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

  const useValues = (slice) => {
    const state = useStateContext(slice);
    return state || {};
  };

  providers.push(ContextProvider);

  return {
    useValues,
    useActions: getUseActions(useDispatchContext),
    Provider: ContextProvider,
  };
};

export const composeProviders = () => {
  const NeutralProvider = ({ children }) => children;
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
