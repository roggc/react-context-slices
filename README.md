Before using react-context-slices maybe you want to consider using [jotai-wrapper](https://www.npmjs.com/package/jotai-wrapper), a super simple and tiny library around jotai that makes using jotai even simpler. The migration from react-context-slices to jotai-wrapper it's fairly simple. In react-context-slices you define a `slices.js` file, so in jotai-wrapper you define an `atoms.js` file. react-context-slices default exports `getHookAndProviderFromSlices` function, so jotai-wrapper default exports `getAPIFromAtoms` function. The reason for migration is a high usage of memory by react-context-slices when using React Context slices.

# react-context-slices

**`react-context-slices`** offers a unique solution to global state management in React by seamlessly integrating both **Redux** and **React Context** with **zero-boilerplate**.

Define your slices using the **`getHookAndProviderFromSlices`** function provided by the library. This gives you the **`useSlice`** hook and a **provider** component.

Use the **`useSlice`** hook in your components to get the value of the slice state, a setter or dispatch function, and an actions object (for Redux slices).

What differentiates a Redux slice from a React Context slice is the presence of the **`reducers`** key in its definition (if present, it's a Redux slice; otherwise it's a React Context slice).

React Context slices can initialize state from **storage** (local for web and async for React Native) and use **middleware** for action workflow customization in a per-slice basis.

Use **`react-context-slices`** to manage global state in React with **zero-boilerplate** either by defining **Redux** slices or **React Context** slices.

## [Dedicated website (recommended)](https://react-context-slices.github.io)

If you want to read this documentation it's fine. But there is a dedicated website for the library. It is recommended you take a look at [it](https://react-context-slices.github.io) instead.

## Table of Contents

[Installation](#installation)  
[How to use it (javascript)](#how-to-use-it-javascript)  
    [Get initial state from storage (React Context slices)](#get-initial-state-from-storage-react-context-slices)  
    [Define middleware (React Context slices)](#define-middleware-react-context-slices)  
    [Pass options to the Redux store](#pass-options-to-the-redux-store)  
[How to use it (typescript)](#how-to-use-it-typescript)  
[How to use it in micro-frontend solutions](#how-to-use-it-in-micro-frontend-solutions)  
[Things you can do](#things-you-can-do)  
[A note on why "initialArg" nomenclature (React Context slices)](#a-note-on-why-initialarg-nomenclature-react-context-slices)  
[A note on testing](#a-note-on-testing)  
[API Reference](#api-reference)  
[License](#license)

## Installation

`npm i react-context-slices`

## How to use it (javascript)

```javascript
// slices.js
"use client";
import getHookAndProviderFromSlices from "react-context-slices";

export const { useSlice, Provider } = getHookAndProviderFromSlices({
  slices: {
    count1: {
      // Redux slice
      initialState: 0,
      reducers: {
        increment: (state) => state + 1,
      },
    },
    count2: {
      // React Context slice
      initialArg: 0,
    },
    count3: {
      // React Context slice
      initialArg: 0,
      reducer: (state, { type }) => {
        switch (type) {
          case "increment":
            return state + 1;
          default:
            return state;
        }
      },
    },
    todos: {
      // Redux slice
      initialState: [],
      reducers: {
        add: (state, { payload }) => {
          state.push(payload);
        },
      },
    },
    // rest of slices (either Redux or React Context slices)
  },
});
```

```javascript
// app.jsx
import { useSlice } from "./slices";

const App = () => {
  const [count1, reduxDispatch, { increment }] = useSlice("count1");
  const [count2, setCount2] = useSlice("count2");
  const [count3, dispatchCount3] = useSlice("count3");
  const [todos, , { add }] = useSlice("todos");
  const [firstTodo] = useSlice("todos", (state) => state[0]);

  return (
    <>
      <div>
        <button onClick={() => reduxDispatch(increment())}>+</button>
        {count1}
      </div>
      <div>
        <button onClick={() => setCount2((c) => c + 1)}>+</button>
        {count2}
      </div>
      <div>
        <button onClick={() => dispatchCount3({ type: "increment" })}>+</button>
        {count3}
      </div>
      <div>
        <button onClick={() => reduxDispatch(add("use react-context-slices"))}>
          add
        </button>
        {todos.map((t, i) => (
          <div key={i}>{t}</div>
        ))}
      </div>
      <div>{firstTodo}</div>
    </>
  );
};

export default App;
```

```javascript
// index.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "./slices";
import App from "./app";

const container = document.getElementById("root");

if (container !== null) {
  createRoot(container).render(
    <StrictMode>
      <Provider>
        <App />
      </Provider>
    </StrictMode>
  );
}
```

### Get initial state from storage (React Context slices)

For React Context slices only, in case you want to get initial value of a slice from local storage, you do:

```javascript
// slices.js
"use client";
import getHookAndProviderFromSlices from "react-context-slices";

export const { useSlice, Provider } = getHookAndProviderFromSlices({
  slices: {
    counter: { initialArg: 0, isGetInitialStateFromStorage: true }, // React Context slice
    // rest of slices (either Redux or React Context slices)
  },
});
```

and then in your component you do:

```javascript
// app.jsx
import { useSlice } from "./slices";
import { useEffect } from "react";

const App = () => {
  const [count, setCount] = useSlice("counter");

  // this persist the value to local storage
  useEffect(() => {
    localStorage.setItem("counter", JSON.stringify(count));
  }, [count]);

  return (
    <>
      <button onClick={() => setCount((c) => c + 1)}>+</button>
      {count}
    </>
  );
};

export default App;
```

For React Native you do the same but pass also `AsyncStorage` to the configuration object accepted by `getHookAndProviderFromSlices`:

```javascript
// slices.js
import getHookAndProviderFromSlices from "react-context-slices";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const { useSlice, Provider } = getHookAndProviderFromSlices({
  slices: {
    counter: { initialArg: 0, isGetInitialStateFromStorage: true }, // React Context slice
    // rest of slices (either Redux or React Context slices)
  },
  AsyncStorage, // <-- set AsyncStorage key to AsyncStorage for React Native
});
```

and in your component you must do (for React Native):

```javascript
// app.jsx
import React, { useEffect, useRef } from "react";
import { useSlice } from "./slices";
import { Button, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const App = () => {
  const isInitialMountRef = useRef(true);
  const [count, setCount] = useSlice("counter");

  useEffect(() => {
    (async () => {
      !isInitialMountRef.current &&
        (await AsyncStorage.setItem("counter", JSON.stringify(count)));
    })();
  }, [count]);

  useEffect(() => {
    isInitialMountRef.current = false;
  }, []);

  return (
    <View>
      <Button title="+" onPress={() => setCount((c) => c + 1)} />
      <Text>{count}</Text>
    </View>
  );
};

export default App;
```

### Define middleware (React Context slices)

For React Context slices only, you can also pass middleware (without access to the state). You must specify it in the definition of a slice:

```javascript
// slices.js
"use client";
import getHookAndProviderFromSlices from "react-context-slices";

export const { useSlice, Provider } = getHookAndProviderFromSlices({
  slices: {
    todos: {
      // React Context slice
      initialArg: [],
      reducer: (state, action) => {
        switch (action.type) {
          case "FETCH_TODOS_REQUEST":
            return state;
          case "FETCH_TODOS_SUCCESS":
            return action.payload;
          case "FETCH_TODOS_FAILURE":
            return state;
          default:
            return state;
        }
      },
      middleware: [
        () => (next) => (action) => {
          // <-- logger middleware (first middleware applied)
          console.log("dispathing action:", action);
          next(action);
        },
        (dispatch) => (next) => (action) => {
          // <-- async middleware (second middleware applied)
          if (typeof action === "function") {
            return action(dispatch);
          }
          next(action);
        },
      ],
    },
    // rest of slices (either Redux or React Context slices)
  },
});
```

Then you can write your action creator like:

```javascript
const fetchTodos = () => async (dispatch) => {
  dispatch({ type: "FETCH_TODOS_REQUEST" });
  try {
    const response = await fetch("https://api.example.com/todos");
    const todos = await response.json();
    dispatch({ type: "FETCH_TODOS_SUCCESS", payload: todos });
  } catch (error) {
    dispatch({ type: "FETCH_TODOS_FAILURE", payload: error.message });
  }
};
```

and then call it in your component with:

```javascript
// todos.jsx
import { useSlice } from "./slices";
import { useEffect } from "react";

const Todos = () => {
  const [todos, dispatchTodos] = useSlice("todos");
  useEffect(() => {
    dispatchTodos(fetchTodos());
  }, [dispatchTodos]);
  return {todos.map(/* ... */)};
};

export default Todos;
```

### Pass options to the redux store

You can also pass options to the Redux store (parameters of the `configureStore` function from Redux Toolkit, except `reducer`; check the documentation in Redux Toolkit):

```javascript
"use client";
import getHookAndProviderFromSlices from "react-context-slices";

export const { useSlice, Provider } = getHookAndProviderFromSlices({
  slices: {
    count1: {
      // Redux slice
      initialState: 0,
      reducers: {
        increment: (state) => state + 1,
      },
    },
    // rest of slices (either Redux or React Context slices)
  },
  reduxStoreOptions: {
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat((store) => (next) => (action) => {
        console.log("dispatching action:", action);
        next(action);
        console.log("next state:", store.getState());
      }),
  },
});
```

## How to use it (typescript)

```typescript
// slices.ts
"use client";
import getHookAndProviderFromSlices, {
  defineSlice,
} from "react-context-slices";

export const { useSlice, Provider } = getHookAndProviderFromSlices({
  slices: {
    count1: defineSlice<number>({
      // Redux slice
      initialState: 0,
      reducers: {
        increment: (state) => state + 1,
      },
    }),
    count2: defineSlice<number>({
      // React Context slice
      initialArg: 0,
    }),
    count3: defineSlice<number>({
      // React Context slice
      initialArg: 0,
      reducer: (state, { type }) => {
        switch (type) {
          case "increment":
            return state + 1;
          default:
            return state;
        }
      },
    }),
    todos: defineSlice<string[]>({
      // Redux slice
      initialState: [],
      reducers: {
        add: (state, { payload }) => {
          state.push(payload);
        },
      },
    }),
    // rest of slices (either Redux or React Context slices)
  },
});
```

Then in your component:

```typescript
// app.tsx
import { useSlice } from "./slices";

const App = () => {
  const [count1, reduxDispatch, { increment }] = useSlice<number>("count1");
  const [count2, setCount2] = useSlice<number>("count2");
  const [count3, dispatchCount3] = useSlice<number>("count3");
  const [todos, , { add }] = useSlice<string[]>("todos");
  const [firstTodo] = useSlice<string[], string>("todos", (state) => state[0]);

  return (
    <>
      <div>
        <button onClick={() => reduxDispatch(increment())}>+</button>
        {count1}
      </div>
      <div>
        <button onClick={() => setCount2((c) => c + 1)}>+</button>
        {count2}
      </div>
      <div>
        <button onClick={() => dispatchCount3({ type: "increment" })}>+</button>
        {count3}
      </div>
      <div>
        <button onClick={() => reduxDispatch(add("use react-context-slices"))}>
          add
        </button>
        {todos.map((t, i) => (
          <div key={i}>{t}</div>
        ))}
      </div>
      <div>{firstTodo}</div>
    </>
  );
};

export default App;
```

## How to use it in micro-frontend solutions

`react-context-slices` is well-suited for micro-frontend solutions. It
enables seamless sharing of state among micro-frontend projects and
provides support for local shared state within each individual
micro-frontend. With react-context-slices, both shared states can
coexist harmoniously within each micro-frontend project. Check out
**[this](https://medium.com/@roggc9/react-webpack-module-federation-with-shared-state-micro-frontend-app-891fe7effad4)**
step-by-step article on how to implement it effectively.

## Things you can do

```javascript
// slices.js
"use client";
import getHookAndProviderFromSlices from "react-context-slices";

export const { useSlice, Provider } = getHookAndProviderFromSlices({
  slices: {
    count: {}, // <-- intialArg === undefined (React Context slice)
    // rest of slices (either Redux or React Context slices)
  },
});
```

```javascript
// slices.js
"use client";
import getHookAndProviderFromSlices from "react-context-slices";

export const { useSlice, Provider } = getHookAndProviderFromSlices({
  slices: {
    isLightTheme: { initialArg: true, reducer: (state) => !state }, // <-- reducer without action (React Context slice)
    // rest of slices (either Redux or React Context slices)
  },
});
```

```javascript
// slices.js
"use client";
import getHookAndProviderFromSlices from "react-context-slices";

export const { useSlice, Provider } = getHookAndProviderFromSlices({
  slices: {
    greeting: { initialArg: "hello", reducer: () => "bye" }, // <-- reducer without state and action (React Context slice)
    // rest of slices (either Redux or React Context slices)
  },
});
```

```javascript
// slices.js
"use client";
import getHookAndProviderFromSlices from "react-context-slices";

export const { useSlice, Provider } = getHookAndProviderFromSlices({
  slices: {
    greeting: { init: () => "hello" }, // <-- pass an 'init' function without an 'initialArg' (React Context slice)
    // rest of slices (either Redux or React Context slices)
  },
});
```

```javascript
// app.jsx
import { useSlice } from "./slices";

const App = () => {
  const [foo, setFoo] = useSlice(""); // 'foo' and 'setFoo' will be undefined. If you pass an empty string or a slice name that has not been defined (doesn't exist), it returns undefined for both 'value' and 'setValue'
  return null;
};

export default App;
```

## A note on why "initialArg" nomenclature (React Context slices)

To define a slice you must pass an object which its possible keys (all optional) are `initialArg`, `init`, `reducer`, `isGetInitialStateFromStorage` and `middleware`. The first three of them are exactly the same as the defined in the React docs about `useReducer` hook. Check there the info to know what they do. The `isGetInitialStateFromStorage` its name is not `isGetInitialArgFromStorage` because in this case the `init` function will not be applied (in the case that a value from local storage has been recovered) even when supplied in the definition of the slice because what we save in the local storage it's the state value and not `initialArg`, so when we recover it we do not must apply the `init` function and use directly this value as initial state.

## A note on testing

If you want to write unit tests while using the library, you must exclude `react-context-slices` from `transformIgnorePatterns` in `jest` configuration file:

```javascript
// jest.config.js
module.exports = {
  transformIgnorePatterns: ["/node_modules/(?!(react-context-slices)/)"],
  // rest of configuration settings
};
```

On React Native you should also exclude `react-native` from the list of `transformIgnorePatterns`:

```javascript
// jest.config.js
module.exports = {
  transformIgnorePatterns: [
    "/node_modules/(?!(react-context-slices|@react-native|react-native)/)",
  ],
  // rest of configuration settings
};
```

Essentially what this tells is to not parse the `node_modules` folder **except** for `react-context-slices`. This is so because `react-context-slices` has `import` statements in it, and need to be parsed by `tsc` or `babel` when using `jest`.

## API Reference

The library exports two functions: `getHookAndProviderFromSlices` and `defineSlice`. The first one is the main one and it's a default export. The second one it's only used in typescript.

<table><tr><th>Name</th>                                           <th>Type</th>                                                                   <th>Description</th>                                                                                                                                                                                                                                <th>Example</th></tr><tr>
<td>

`getHookAndProviderFromSlices` (default import)

</td>  <td>

```typescript
(config: {
  slices?: {
    [slice: string]: Slice<any, any>;
  };
  AsyncStorage?: any;
  reduxStoreOptions?: {
    middleware:
      | ((getDefaultMiddleware: any) => MiddlewareArray)
      | MiddlewareArray;
  };
}) => {
  useSlice: (<T, K = T>(
    slice: string,
    selector: (state: T) => K
  ) => [K, ReduxDispatch<AnyAction>, { [x: string]: any }]) &
    (<T, K = T>(
      slice: string
    ) => [
      K,
      SetValue<T> & Dispatch & ReduxDispatch<AnyAction>,
      { [x: string]: any }
    ]);
  Provider: ContextProviderType;
}
```

</td> <td>

It is the main (and default) function exported by the library. You pass a config object with optional keys `slices`, `AsyncStorage`, and `reduxStoreOptions`. The `slices` key is an object wich its keys are the slices names and its values, the defintion of the slices.

</td> <td>

```javascript
export const { useSlice, Provider } = getHookAndProviderFromSlices({
  slices: {
    count: { initialArg: 0 },
  },
});
```

</td></tr><tr>                     
<td>

`defineSlice` (used in typescript)

</td>              <td>

```typescript
<T, K = T>(slice: Slice<T, K>) => Slice<T, K>;
```

</td>                              <td>

This function enforces rules for types in the definition of a slice object. It's a generic function.

</td>                                              <td>

```typescript
export const { useSlice, Provider } = getHookAndProviderFromSlices({
  slices: {
    count: defineSlice<number>({ initialArg: 0 }),
  },
});
```

</td></tr>
<tr>
<td>

`ReduxMiddleware` (typescript type)

</td>
<td>

```typescript
(store: {
  getState: () => any;
  dispatch: ReduxDispatch<AnyAction>;
}) => (next: ReduxDispatch<AnyAction>) => (action: AnyAction) => void;
```

</td>
<td>

Is the type against to make an assertion in typescript when defining middleware in `reduxStoreOptions`

</td>
<td>

```typescript
{
  reduxStoreOptions: {
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(((store) => (next) => (action) => {
        //...
      }) as ReduxMiddleware);
  }
}
```

</td>
</tr>
</table>

Next are described other entities encountered when using this library:

<table><tr><th>Name</th>                       <th>Type</th>                                                                                                                                                                                                                              <th>Description</th>                                                                                                                                                                                                                                                                                                                                                     <th>Example</th>                                                                                                                                                                                                         </tr>
<tr>
<td>

config object

</td>
<td>

```typescript
{
  slices?: {
    [slice: string]: Slice<any, any>;
  };
  AsyncStorage?: any;
  reduxStoreOptions?: {
    middleware?:
      | ((getDefaultMiddleware: any) => MiddlewareArray)
      | MiddlewareArray;
    devTools?: any;
    preloadedState?: any;
    enhancers?: any;
  };
}
```

</td>
<td>

It's the object passed to `getHookAndProviderFromSlices`. It can contain three optional keys: `slices`, `AsyncStorage`, and `reduxStoreOptions`.

</td>
<td>

```javascript
{
  slices: {
    //...
  }
}
```

</td>
</tr>
<tr><td>

slices object

</td>                   <td>

```typescript
{
  [name:string]: Slice<T, K>;
}
```

</td>                                                                                                                                                                                                 <td>

The slices object is an object which its keys are the name of the slices and its values are the slices themselves.

</td>  <td>

```javascript
{
  count: {initialArg: 0}, // Context slice
  todos: { // Redux slice
    initialState: [],
    reducers: {
      add: (state, {payload}) => {
        state.push(payload);
      }
    }
  }
}
```

</td></tr><tr>                                                                                                                                                             
<td>

a slice object

</td>                 <td>

```typescript
{
  initialArg?: K | T;
  init?: (initialArg: K) => T;
  reducer?: (state: T, action: any) => T;
  isGetInitialStateFromStorage?: boolean;
  middleware?: ((dispatch: Dispatch) => (next: Dispatch) => (action: any) => any)[];
} | {
  initialState: NonUndefined<T>;
  reducers: {
    [x: string]: {
      (state: T, action: any): void | T;
    };
  };
}
```

</td>
 <td>
 
 A slice object is an object which its possible keys are for a React Context slice: `initialArg`, `init`, `reducer`, `isGetInitialStateFromStorage`, and `middleware`; and for a Redux slice: `reducers`, and `initialState`. The keys for a React Context slice are all optional. What makes a slice to be a Redux slice is the presence of the `reducers` key. If it's not present, then it is a React Context slice.
 
 </td>                                                                                                                                                                                                             <td>
 
```javascript
{} // React Context slice
```
 
 </td></tr><tr>                                                                                                                                                  
<td>

`initialArg`

</td>                   <td>

```typescript
K | T;
```

</td>                                                                                                                                                                                                                           <td>

It's the argument passed to the `init` function to compute the initial state. If no `init` function is present in the definition of the slice, then it becomes the initial state. Used in React Context slices.

</td>                                                                                                                                                                                       <td>

```javascript
{
  initialArg: 0;
}
```

</td>                                                                                                                                                                                               
</tr><tr><td>

`init`

</td>                         <td>

```typescript
(initialArg: K) => T;
```

</td>                                                                                                                                                                                                             <td>

It's the function used to compute initial state of the slice. It takes `initialArg` as an argument. If no present then `initialArg` it's the initial state. Used in React Context slices.

</td>                                                                                                                                                                                                            <td>

```javascript
{
  init: () => 0;
}
```

</td></tr><tr>                                                                                                                                                                                               
<td>

`reducer`

</td>                      <td>

```typescript
(state: T, action: any) => T;
```

</td>                                                                                                                                                                                                     <td>

If a reducer is supplied in the definition of a React Context slice, then the `useSlice`, when used with this slice, will return a dispatch function as a second value in the array. If it is not defined, then the `useSlice` hook will return, for this slice, a setter function as a second value in the array.

</td>                                                                      <td>

```javascript
{
  reducer: (state) => !state;
}
```

</td></tr><tr>                                                                                                                                                                                    
<td>

`isGetInitialStateFromStorage`

</td>  <td>

```typescript
boolean;
```

</td>                                                                                                                                                                                                                          <td>

Indicates whether the initial state for the slice will be recovered from local storage (web) or Async Storage (React Native). Used in React Context slices.

</td>                                                                                                                                                                                                                                           <td>

```javascript
{
  isGetInitialStateFromStorage: true;
}
```

</td></tr><tr>                                                                                                                                                                          
<td>

`middleware`

</td>                   <td>

```typescript
((dispatch: Dispatch) => (next: Dispatch) => (action: any) => any)[]
```

</td>                                                                                                                                                             <td>

It's an array where the middleware for the dispatch function is passed. The first middleware applied will be the first on the array, the second the next, etc, ending with the dispatch function itself. The middleware does not have access to the state value of the slice. Used in React Context slices.

</td>                                                                                                                                                               <td>

```javascript
{
  middleware: [
    () => (next) => (action) => {
      console.log("I am a middleware");
      next(action);
    },
    (dispatch) => (next) => (action) => {
      if (typeof action === "function") {
        return action(dispatch);
      }
      next(action);
    },
  ];
}
```

</td></tr>
<tr>
<td>

`reducers`

</td>
<td>

```typescript
{
  [x: string]: {
    (state: T, action: any): void | T;
  };
}
```

</td>
<td>

When this key is present in the definition of a slice object, then the slice it's a Redux slice. Otherwise it's a React Context slice. It's the `reducers` object passed to the `createSlice` from Redux Toolkit (check the documentation there).

</td>
<td>

```javascript
{
  initialState: 0,
  reducers: {
    increment: (state) => state + 1,
    decrement: (state) => state - 1
  }
}
```

</td>
</tr>
<tr>
<td>

`initialState`

</td>
<td>

```typescript
T extends undefined ? never : T;
```

</td>
<td>

Used for Redux slices. It's the initial state for the slice. Cannot be `undefined` (make it `null` instead).

</td>
<td>

```javascript
{
  initialState: [],
  reducers: {
    add: (state, {payload}) => {
      state.push(payload);
    }
  }
}
```

</td>
</tr>
<tr>
<td>

`useSlice`

</td>                     <td>

```typescript
(<T, K = T>(
    slice: string,
    selector: (state: T) => K
  ) => [K, ReduxDispatch<AnyAction>, { [x: string]: any }]) &
    (<T>(
      slice: string
    ) => [
      T,
      SetValue<T> & Dispatch & ReduxDispatch<AnyAction>,
      { [x: string]: any }
    ]);
```

</td>                                                                                                                                                                            <td>

It's the hook returned by the call to `getHookAndProviderFromSlices`. When used, you must pass the name of the slice you want to fetch or use. It will return, in the case of a React Context slice, an array where the first element is the state value of the slice and the second a dispatch or setter function, depending on if a reducer was defined or not for the slice. In the case of Redux slices, you can pass a selector as a second parameter to the call of the `useSlice` hook. It will return an array where the first element is the state value for the slice (with the selector applied, if any), the second element is the dispatch function, and the third element is the actions object (action creators) for the slice.

</td>                                                    <td>

```javascript
const [count, setCount] = useSlice("count");
const [count2, dispatchCount2] = useSlice("count2");
const [count3, dispatchCount3, { increment, decrement }] = useSlice("count3");
const [todos, dispatchTodos, { add }] = useSlice("todos");
const [firstTodo] = useSlice("todos", (state) => state[0]);
```

</td></tr><tr>                                                                                                                                                                  
<td>

`Provider`

</td>                     <td>

```typescript
({ children }: React.PropsWithChildren) => JSX.Element;
```

</td>                                                                                                                                                                             <td>

It's the provider returned by the call to `getHookAndProviderFromSlices`. It must be used up in the tree, in order for the hook `useSlice` to work.

</td>                                                                                                                                                                                                                    <td>

```javascript
root.render(
  <Provider>
    <App />
  </Provider>
);
```

</td></tr></table>

## License

Licensed under the ISC License, Copyright © 2022-present Roger Gomez Castells.

See [LICENSE](./LICENSE) for more information.
