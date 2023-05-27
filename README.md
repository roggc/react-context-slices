# react-context-slices

With this package, manage state through Context is extremely easy, fast and optimal. All you have to do is import a function (`getHookAndProviderFromSlices`) which will get you a hook and a provider. The hook, `useSlice`, it's similar to the `useState` hook, the only difference is that you must pass the name of the slice of Context you want to fetch. And that's all.

## Installation

`npm i react-context-slices`

## How to use it

```javascript
//slices.ts

import getHookAndProviderFromSlices from "react-context-slices";

export const { useSlice, Provider } = getHookAndProviderFromSlices({
  counter: 0,
  // rest of slices, for example:
  // todos: [],
  // counter2: 0,
  // etc.
});
```

```typescript
//app.tsx

import { useSlice } from "./slices";

const App = () => {
  const [count, setCount] = useSlice<number>("counter");
  return (
    <>
      <button onClick={() => setCount((c) => c + 1)}>increment</button>
      {count}
    </>
  );
};

export default App;
```

```javascript
//index.tsx

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
//slices.ts

import getHookAndProviderFromSlices from "react-context-slices";

export const { useSlice, Provider } = getHookAndProviderFromSlices(
  {
    counter: 0,
    todos: [],
    counter2: 0,
    // etc.
  },
  { counter: true, counter2: true } // <-- this will get initial value of slice from local storage for slices 'counter' and 'counter2', but not for 'todos' slice.
);
```

and then in your component you do:

```typescript
//app.tsx

import { useSlice } from "./hooks/use-slice";
import { useEffect } from "react";

const App = () => {
  const [count, setCount] = useSlice<number>("counter");

  // this persist the value to local storage
  useEffect(() => {
    localStorage.setItem("counter", JSON.stringify(count));
  }, [count]);

  return (
    <>
      <button onClick={() => setCount((c) => c + 1)}>increment</button>
      {count}
    </>
  );
};

export default App;
```

For React Native you do the same but pass `AsyncStorage` as a parameter to `getHookAndProviderFromSlices`:

```javascript
//slices.ts

import getHookAndProviderFromSlices from "react-context-slices";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const { useSlice, Provider } = getHookAndProviderFromSlices(
  {
    counter: 0,
    counter2: 0,
    todos: [],
    // etc.
  },
  { counter: true }, // <-- this will get initial value of slice 'counter' from local storage
  AsyncStorage // <-- pass this for React Native
);
```

and in your component you do (for React Native):

```typescript
import React, { useEffect, useRef } from "react";
import { useSlice } from "./slices";
import { Button, Text, View, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Counter = () => {
  const isInitialMount = useRef(true);
  const [count, setCount] = useSlice<number>("counter");

  useEffect(() => {
    (async () => {
      if (count !== null && count !== undefined && !isInitialMount.current) {
        await AsyncStorage.setItem("counter", JSON.stringify(count));
      }
    })();
  }, [count]);

  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  return (
    <View style={styles.container}>
      <Button title="increment" onPress={() => setCount((c) => c + 1)} />
      <View>
        <Text>{`counter value is ${count}`}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
  },
});

export default Counter;
```
