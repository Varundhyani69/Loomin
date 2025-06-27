import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Toaster } from "sonner";
import { Provider } from "react-redux";
import store from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
import persistStore from "redux-persist/es/persistStore";
import SocketContext from "./context/SocketContext";
import { io } from "socket.io-client";

const persistor = persistStore(store);

// Initialize socket with userId
const userId = localStorage.getItem("userId");
const socket = io(import.meta.env.VITE_SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket"],
  query: {
    userId,
  },
});

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
