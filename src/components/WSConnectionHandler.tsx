import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
} from "react";
import { Article, ArticleComment, Message, User } from "../utils/Types.tsx";
import {
  UserContext,
  UserUpdateContext,
} from "../context/UserContextProvider.tsx";
import WS_CODE from "../utils/WebscoketCodes.tsx";
import {
  UpdateWebSocketContext,
  WebSocketContext,
} from "../context/WebSocketContextProvider.tsx";

interface WSConnectionHandlerProps {
  selectedFriend: User | null;
  setMessages: Dispatch<SetStateAction<Message[]>>;
  setGroupMessages: Dispatch<SetStateAction<Message[]>>;
  friends: User[];
  setFriends: Dispatch<SetStateAction<User[]>>;
  selectedArticle: Article | null;
  setComments: Dispatch<SetStateAction<ArticleComment[]>>;
  triggerNotification: (success: boolean, message: string) => void;
}

export const WSConnectionHandler: React.FC<WSConnectionHandlerProps> = ({
  selectedFriend,
  setMessages,
  setGroupMessages,
  friends,
  setFriends,
  selectedArticle,
  setComments,
  triggerNotification,
}) => {
  const currUser = useContext(UserContext);
  const ws = useContext(WebSocketContext);
  const setWs = useContext(UpdateWebSocketContext);
  const setCurrUser = useContext(UserUpdateContext);

  const prevSelectedFriend = useRef<User | null>(null);
  const selectedArticleRef = useRef<Article | null>(null);

  useEffect(() => {
    prevSelectedFriend.current = selectedFriend;
  }, [selectedFriend]);

  useEffect(() => {
    selectedArticleRef.current = selectedArticle;
  }, [selectedArticle]);

  useEffect(() => {
    if (!ws || ws.readyState === ws.CLOSING || ws.readyState === ws.CLOSED) {
      const newWs = new WebSocket(
        `${process.env.REACT_APP_WEBSOCKET_SERVER as string}?userId=${
          currUser!.id
        }`
      );

      newWs.onopen = () => {
        console.log("WebSocket connection established.");
      };

      newWs.onmessage = async (event) => {
        const websocketMessage = JSON.parse(event.data);

        if (websocketMessage.type !== WS_CODE.CHECK_ONLINE)
          console.log("Received message", websocketMessage);

        if (websocketMessage.type === WS_CODE.MESSAGE_TRANSFER) {
          try {
            setMessages((prevMessages) => [
              ...prevMessages,
              websocketMessage.data,
            ]);
          } catch (error) {
            console.error("Error receiving and decrypting message:", error);
          }
        } else if (websocketMessage.type === WS_CODE.GROUP_MESSAGE_TRANSFER) {
          try {
            setGroupMessages((prevMessages) => [
              ...prevMessages,
              websocketMessage.data,
            ]);
          } catch (error) {
            console.error("Error receiving and decrypting message:", error);
          }
        } else if (websocketMessage.type === WS_CODE.CHECK_ONLINE) {
          try {
            setFriends(websocketMessage.data.friends);
          } catch (error) {
            console.error("Error setting friends", error);
          }
        } else if (websocketMessage.type === WS_CODE.COMMENT_TRANSFER) {
          if (
            websocketMessage.data.article_id ===
              selectedArticleRef.current?.article_id &&
            websocketMessage.data.author_id !== currUser!.id
          ) {
            setComments((prevComments) => [
              ...prevComments,
              websocketMessage.data,
            ]);
          }
        } else if (websocketMessage.type === WS_CODE.MUTED) {
          setCurrUser({
            ...currUser!,
            muted: true,
          });
          triggerNotification(false, "Unfortunately you have been muted.");
        } else if (websocketMessage.type === WS_CODE.UNMUTED) {
          setCurrUser({
            ...currUser!,
            muted: false,
          });
          triggerNotification(true, "You have been unmuted.");
        }
      };

      newWs.onclose = () => {
        console.log("WebSocket connection closed.");
      };

      newWs.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      setWs(newWs);

      // Clean up WebSocket connection on unmount
      return () => {
        if (
          newWs &&
          newWs.readyState !== WebSocket.CLOSING &&
          newWs.readyState !== WebSocket.CLOSED &&
          selectedFriend
        ) {
          newWs.send(
            JSON.stringify({
              type: WS_CODE.PACKET_DISCONNECT,
              data: {
                senderID: currUser!.id,
                friends: friends,
              },
            })
          );
          newWs.close();
        }
      };
    }
    // eslint-disable-next-line
  }, [currUser, setMessages, selectedFriend]);

  return null;
};
