import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "./store";
import "./index.css";
import '@ant-design/v5-patch-for-react-19';
import { Suspense, StrictMode, lazy } from "react";
import LoadingSpinner from "./components/LoadingSpinner";
const App = lazy(() => import("./App"));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={<LoadingSpinner />}>
      <Provider store={store}>
        <App />
      </Provider>
    </Suspense>
  </StrictMode>
);


