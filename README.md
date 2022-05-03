# react-context-slices

use react context in an optimal way. this library provides two utility functions, `createSlice` and `composeProviders`. Description on how to use them in an App is described below.

## install

npm i react-context-slices

## usage

```javascript
import Counter from "./components/Counter";
import Todos from "./components/Todos";
import AppProvider from "./slices";

function App() {
  return (
    <AppProvider>
      <Counter />
      <Todos />
    </AppProvider>
  );
}

export default App;
```

The `counter` slice will look like this:

```javascript
import { createSlice } from "react-context-slices";

export const slice = "counter";
const initialState = { [slice]: { count: 0 } };
const INCREMENT = "INCREMENT";
const reducer = (draft, action) => {
  switch (action.type) {
    case INCREMENT:
      draft[slice].count += 1;
      break;
    default:
      break;
  }
};

export const { useValues, useActions } = createSlice(
  reducer,
  initialState,
  slice,
  (useDispatch) => () => {
    const dispatch = useDispatch();
    const increment = () => dispatch({ type: INCREMENT });
    return { [slice]: { increment } };
  }
);
```

The `todos` slice will look like (without actions defined):

```javascript
import { createSlice } from "react-context-slices";

export const slice = "todos";
const initialState = { [slice]: { todos: [{ text: "todo 1" }] } };
const reducer = () => {};

export const { useValues, useActions } = createSlice(
  reducer,
  initialState,
  slice,
  (useDispatch) => () => ({ [slice]: {} })
);
```

They both will be combined into one single interface:

```javascript
import { composeProviders } from "react-context-slices";
import {
  useValues as useTodosValues,
  useActions as useTodosActions,
} from "./todos";
import {
  useValues as useCounterValues,
  useActions as useCounterActions,
} from "./counter";

export const useValues = (slice) => ({
  ...useTodosValues(slice),
  ...useCounterValues(slice),
});
export const useActions = () => ({
  ...useTodosActions(),
  ...useCounterActions(),
});

export default composeProviders();
```

The `Counter` component would be like:

```javascript
import { useValues, useActions } from "../slices";
import { slice as counter } from "../slices/counter";

const Counter = () => {
  const {
    [counter]: { count },
  } = useValues(counter);
  const {
    [counter]: { increment },
  } = useActions();
  return (
    <div>
      <button onClick={increment}>+</button>
      {count}
    </div>
  );
};

export default Counter;
```

And the `Todos` component would be like:

```javascript
import { useValues } from "../slices";
import { slice as todos_ } from "../slices/todos";

const Todos = () => {
  const {
    [todos_]: { todos },
  } = useValues(todos_);
  return <div>{todos[0].text}</div>;
};

export default Todos;
```
