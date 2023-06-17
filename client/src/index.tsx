import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux"; // react-redux에서 Provider를 불러옵니다.
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { store } from './stores';

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}> {/* Redux의 store를 Provider에 전달합니다. */}
            <App />
        </Provider>
    </React.StrictMode>,
    document.getElementById("root")
);

reportWebVitals();
