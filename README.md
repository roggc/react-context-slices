# react-context-slices

This package allows to manage state through Context in a React or React Native app in an easy, fast and optimal way. You have to import a function (`getHookAndProviderFromSlices`), define the slices of Context you want and this function will get you a hook and a provider. The hook, `useSlice`, acts either as a `useState` hook or a `useReducer` hook, depending on if you defined or not a reducer for the slice.

## Installation

`npm i react-context-slices`

## How to use it (javascript)

```javascript
//slices.js
import getHookAndProviderFromSlices from "react-context-slices";

export const { useSlice, Provider } = getHookAndProviderFromSlices({
  count: { initialState: 0 },
  count2: {
    initialState: 0,
    reducer: (state, { type }) => {
      switch (type) {
        case "increment":
          return state + 1;
        default:
          return state;
      }
    },
  },
  // rest of slices
});
```

```javascript
//app.jsx
import { useSlice } from "./slices";

const App = () => {
  const [count, setCount] = useSlice("count");
  const [count2, dispatchCount2] = useSlice("count2");
  return (
    <>
      <div>
        <button onClick={() => setCount((c) => c + 1)}>+</button>
        {count}
      </div>
      <div>
        <button onClick={() => dispatchCount2({ type: "increment" })}>+</button>
        {count2}
      </div>
    </>
  );
};

export default App;
```

```javascript
//index.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "./slices";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <Provider>
      <App />
    </Provider>
  </React.StrictMode>
);
```

In case you want to get initial value of a slice from local storage, you do:

```javascript
//slices.js
import getHookAndProviderFromSlices from "react-context-slices";

export const { useSlice, Provider } = getHookAndProviderFromSlices({
  counter: { initialState: 0, isGetInitialStateFromStorage: true },
  // rest of slices
});
```

and then in your component you do:

```javascript
//app.jsx
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

For React Native you do the same but pass `AsyncStorage` as a second parameter to `getHookAndProviderFromSlices`:

```javascript
//slices.js
import getHookAndProviderFromSlices from "react-context-slices";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const { useSlice, Provider } = getHookAndProviderFromSlices(
  {
    counter: { initialState: 0, isGetInitialStateFromStorage: true },
    // rest of slices
  },
  AsyncStorage // <-- pass this for React Native
);
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
      !isInitialMount.current &&
        (await AsyncStorage.setItem("counter", JSON.stringify(count)));
    })();
  }, [count]);

  useEffect(() => {
    isInitialMount.current = false;
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

## How to use it (typescript)

```typescript
// slices.ts
import getHookAndProviderFromSlices, {
  defineSlice,
} from "react-context-slices";

export const { useSlice, Provider } = getHookAndProviderFromSlices({
  count: defineSlice<number>({
    initialState: 0,
  }),
});
```

```typescript
// app.tsx
import { useSlice } from "./slices";

const App = () => {
  const [count, setCount] = useSlice<number>("count");
  return (
    <>
      <div>
        <button onClick={() => setCount((c) => c + 1)}>+</button>
        {count}
      </div>
    </>
  );
};

export default App;
```

## Things you can do

```javascript
// slices.js
import getHookAndProviderFromSlices from "react-context-slices";

export const { useSlice, Provider } = getHookAndProviderFromSlices({
  count: {}, //<-- intialState===undefined
});
```

```javascript
// slices.js
import getHookAndProviderFromSlices from "react-context-slices";

export const { useSlice, Provider } = getHookAndProviderFromSlices({
  isLightTheme: { initialState: true, reducer: (state) => !state }, // <-- reducer without action
});
```

```javascript
// slices.js
import getHookAndProviderFromSlices from "react-context-slices";

export const { useSlice, Provider } = getHookAndProviderFromSlices({
  greeting: { initialState: "hello", reducer: () => "bye" }, // <-- reducer without state and action
});
```
