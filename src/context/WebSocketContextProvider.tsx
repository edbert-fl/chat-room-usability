import React, {
  createContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

interface WebSocketContextProviderProps {
  children: ReactNode;
}

export const WebSocketContext = createContext<WebSocket | null>(null);
export const UpdateWebSocketContext = createContext<
  Dispatch<SetStateAction<WebSocket | null>>
>(() => null);

const WebSocketContextProvider = ({
  children,
}: WebSocketContextProviderProps) => {
  const [ws, setWs] = useState<WebSocket | null>(null);

  return (
    <WebSocketContext.Provider value={ws}>
      <UpdateWebSocketContext.Provider value={setWs}>
        {children}
      </UpdateWebSocketContext.Provider>
    </WebSocketContext.Provider>
  );
};

export default WebSocketContextProvider;
