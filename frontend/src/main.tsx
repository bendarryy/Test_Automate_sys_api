import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "./store";
import "./index.css";
import '@ant-design/v5-patch-for-react-19';
import { StrictMode, lazy, Suspense } from "react";
import Loading from "./shared/componanets/Loading";
const App = lazy(() => import("./App"));
import { App as AntdApp } from 'antd';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from './queryClient';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
      <Provider store={store}>  
        <QueryClientProvider client={queryClient}>
          <AntdApp>
            <Suspense fallback={<Loading />}>
              <App />
            </Suspense>
          </AntdApp>
        </QueryClientProvider>
      </Provider>
  </StrictMode>
);


