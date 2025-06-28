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

const userId = localStorage.getItem("userId");
const token = localStorage.getItem("token");

const socket = userId && token
  ? io(import.meta.env.VITE_SOCKET_URL, {
    withCredentials: true,
    transports: ["websocket"],
    auth: { token },
    query: { userId },
    reconnection: true,
  })
  : null;

if (socket) {
  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
  });

  socket.on("error", (error) => {
    console.error("Socket error:", error.message);
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SocketContext.Provider value={{ socket }}>
          <App />
          <Toaster />
        </SocketContext.Provider>
      </PersistGate>
    </Provider>
  </StrictMode>
);
