import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "./store";
import "./index.css";
import '@ant-design/v5-patch-for-react-19';
import { StrictMode, lazy } from "react";
const App = lazy(() => import("./App"));
import { App as AntdApp } from 'antd';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
      <Provider store={store}>  
        <AntdApp>
          <App />
        </AntdApp>
      </Provider>
  </StrictMode>
);


