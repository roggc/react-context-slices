import * as React from "react";
import { ImmerReducer } from "use-immer";
import { Immutable, Draft } from "immer";
export type ContextProviderType = ({ children, }: React.PropsWithChildren) => JSX.Element;
export type UseActionsResult = {
    [x: string]: {
        [y: string]: <F extends () => void>(...args: Parameters<F>) => void;
    };
};
export type GenericAction = {
    type: string;
    payload?: unknown;
};
export type GenericDraft<S> = Draft<Immutable<S>>;
export type EmptyObject = {};
export declare const createSlice: <S, A>(reducer: ImmerReducer<S, A>, initialState: S, name: string, getUseActions: (useDispatch: () => React.Dispatch<A>) => () => UseActionsResult, localStorageKeys?: string[]) => {
    useValues: (slice: string) => EmptyObject | S;
    useActions: () => UseActionsResult;
    Provider: ({ children }: React.PropsWithChildren) => JSX.Element;
};
export declare const composeProviders: () => ContextProviderType;
