# react-context-slices

## install

npm i react-context-slices

## usage

```javascript
import { composeProviders } from "react-context-slices";
import Counter from "./components/Counter";

const AppProvider = composeProviders();

function App() {
  return (
    <AppProvider>
      <Counter />
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

createSlice(
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

And finally the `Counter` component:

```javascript
import { useValues, useActions } from "react-context-slices";
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