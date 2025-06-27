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

// Get userId from storage
const userId = localStorage.getItem("userId");
const socket = userId
  ? io(import.meta.env.VITE_SOCKET_URL || "https://loomin-backend-production.up.railway.app", {
    withCredentials: true,
    transports: ["websocket", "polling"], // Allow fallback to polling
    query: { userId },
  })
  : null;

if (socket) {
  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });
  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
  });
}

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