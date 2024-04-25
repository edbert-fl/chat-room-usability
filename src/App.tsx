import React from "react";
import "./App.css";
import UserContextProvider from "./context/UserContextProvider.tsx";
import AppRouter from "./navigation/AppRouter.tsx";
import EncryptionContextProvider from "./context/EncryptionContextProvider.tsx";
import WebSocketContextProvider from "./context/WebSocketContextProvider.tsx";

export const App = () => {
  return (
    <EncryptionContextProvider>
      <UserContextProvider>
        <WebSocketContextProvider>
          <div className="App">
            <div className="page bg-teal-900">
              <AppRouter />
            </div>
          </div>
        </WebSocketContextProvider>
      </UserContextProvider>
    </EncryptionContextProvider>
  );
};

export default App;
