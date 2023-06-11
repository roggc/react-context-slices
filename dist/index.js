import * as React from "react";
const __SET_INIT_PERSISTED_STATE_RN__ = "__SET_INIT_PERSISTED_STATE_RN__";
const createSlice = (reducer, initialArg, init, name, getUseActions, isGetInitialStateFromStorage, AsyncStorage, middleware = []) => {
    const StateContext = React.createContext({});
    const DispatchContext = React.createContext(() => {
        console?.log("You must use the Provider up in the tree");
    });
    const useStateContext = (slice) => React.useContext(slice === name ? StateContext : {});
    const useDispatchContext = () => React.useContext(DispatchContext);
    const useValues = (slice) => {
        const state = useStateContext(slice);
        return state ?? {};
    };
    const useActions = getUseActions(useDispatchContext);
    let initialState_;
    if (isGetInitialStateFromStorage && !AsyncStorage) {
        let item;
        (item = localStorage.getItem(name)) !== null &&
            (initialState_ = JSON.parse(item));
    }
    const Provider = ({ children }) => {
        const reducerWrapper = (reducer) => (state, action) => !!action && action.type === __SET_INIT_PERSISTED_STATE_RN__
            ? reducer(action.payload, action)
            : reducer(state, action);
        const [state, dispatch] = React.useReducer(!!AsyncStorage & isGetInitialStateFromStorage
            ? reducerWrapper(reducer)
            : reducer, initialState_ !== undefined ? initialState_ : initialArg, initialState_ !== undefined ? undefined : init);
        const enhancedDispatch = React.useCallback(middleware
            .map((middleware) => middleware((action) => enhancedDispatch(action)))
            .reduceRight((dispatch, middleware) => middleware(dispatch), dispatch), [dispatch]);
        React.useEffect(() => {
            if (isGetInitialStateFromStorage && !!AsyncStorage) {
                (async () => {
                    let item;
                    let updateState;
                    (item = await AsyncStorage?.getItem?.(name)) !== null &&
                        (updateState = JSON.parse(item));
                    return updateState;
                })().then((updateState) => updateState !== undefined &&
                    dispatch({
                        type: __SET_INIT_PERSISTED_STATE_RN__,
                        payload: updateState,
                    }));
            }
        }, []);
        return (React.createElement(StateContext.Provider, { value: { [name]: state } },
            React.createElement(DispatchContext.Provider, { value: enhancedDispatch }, children)));
    };
    return {
        useValues,
        useActions,
        Provider,
    };
};
const composeProviders = (providers) => {
    const NeutralProvider = ({ children }) => React.createElement(React.Fragment, null, children);
    return providers.reduce((AccProvider, Provider) => ({ children }) => (React.createElement(Provider, null,
        React.createElement(AccProvider, null, children))), NeutralProvider);
};
const createTypicalSlice = (name, initialArg, reducer, init, isGetInitialStateFromStorage, AsyncStorage, middleware) => {
    const SET = "SET";
    const reducer_ = reducer ??
        ((state, { type, payload }) => {
            switch (type) {
                case SET:
                    return typeof payload === "function" ? payload(state) : payload;
                default:
                    return state;
            }
        });
    const { useValues, useActions, Provider } = createSlice(reducer_, initialArg, init, name, (useDispatch) => () => {
        const dispatch = useDispatch();
        const set = React.useCallback((value) => dispatch({ type: SET, payload: value }), [dispatch]);
        return !!reducer ? { [name]: { dispatch } } : { [name]: { set } };
    }, isGetInitialStateFromStorage, AsyncStorage, middleware);
    return { useValues, useActions, Provider };
};
const getHookAndProviderFromSlices = (slices = {}, AsyncStorage = null) => {
    const { useValues, useActions, providers } = Object.entries(slices)
        .map(([name, { initialArg, reducer, isGetInitialStateFromStorage, init, middleware },]) => createTypicalSlice(name, initialArg, reducer, init, !!isGetInitialStateFromStorage, AsyncStorage, middleware))
        .reduce((res, values) => ({
        useValues: (slice) => ({
            ...res.useValues(slice),
            ...values.useValues(slice),
        }),
        useActions: () => ({ ...res.useActions(), ...values.useActions() }),
        providers: [...res.providers, values.Provider],
    }), {
        useValues: (slice) => ({}),
        useActions: () => ({}),
        providers: [],
    });
    const useSlice = (name) => {
        const { [name]: value } = useValues(name);
        const { [name]: actions } = useActions();
        return [value, !!slices[name]?.reducer ? actions.dispatch : actions?.set];
    };
    const Provider = composeProviders(providers);
    return {
        useSlice,
        Provider,
    };
};
export const defineSlice = (slice) => slice;
export default getHookAndProviderFromSlices;
