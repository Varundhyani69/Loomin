// main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "sonner";
import { Provider } from "react-redux";
import store from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
import persistStore from "redux-persist/es/persistStore";
import { io } from "socket.io-client";
import SocketContext from "./context/SocketContext";

const persistor = persistStore(store);

// ✅ Get userId from storage after it's available
const userId = localStorage.getItem("userId");
const socket = userId
  ? io(import.meta.env.VITE_SOCKET_URL, {
    withCredentials: true,
    transports: ["websocket"],
    query: { userId },
  })
  : null; // don’t connect if not logged in

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SocketContext.Provider value={socket}>
          <App />
          <Toaster />
        </SocketContext.Provider>
      </PersistGate>
    </Provider>
  </StrictMode>
);
