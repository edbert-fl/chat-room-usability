import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Article, ArticleComment, Message, User } from "../utils/Types";
import { TokenContext, UserContext } from "../context/UserContextProvider.tsx";
import { RandomEmoji } from "./RandomEmoji.tsx";
import WS_CODE from "../utils/WebscoketCodes.tsx";
import {
  UpdateWebSocketContext,
  WebSocketContext,
} from "../context/WebSocketContextProvider.tsx";

interface ChatRoomProps {
  selectedFriend: User | null;
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  setGroupMessages: Dispatch<SetStateAction<Message[]>>;
  friends: User[];
  setFriends: Dispatch<SetStateAction<User[]>>;
  selectedArticle: Article | null;
  setComments: Dispatch<SetStateAction<ArticleComment[]>>;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  selectedFriend,
  messages,
  setMessages,
  setGroupMessages,
  friends,
  setFriends,
  selectedArticle,
  setComments
}) => {
  let prevAuthorID: number | null = null;

  const currUser = useContext(UserContext);
  const token = useContext(TokenContext);
  const ws = useContext(WebSocketContext);
  const setWs = useContext(UpdateWebSocketContext);

  const scrollableDivRef = useRef<HTMLDivElement>(null);

  const prevSelectedFriend = useRef<User | null>(null);

  useEffect(() => {
    prevSelectedFriend.current = selectedFriend;
  }, [selectedFriend]);

  const [messageDraft, setMessageDraft] = useState<string>("");

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
          console.log("received message", websocketMessage)

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
            setFriends(websocketMessage.data.friends)
          } catch (error) {
            console.error("Error setting friends", error);
          }
        } else if (websocketMessage.type === WS_CODE.PACKET_DISCONNECT) {
          if (
            websocketMessage.data.senderID === prevSelectedFriend.current?.id
          ) {
            console.log(
              `Deleting ${prevSelectedFriend.current?.username}'s public key`
            );
          }
        } else if (websocketMessage.type === WS_CODE.COMMENT_TRANSFER) {
          console.log(websocketMessage.data.article_id)
          console.log(selectedArticle)
          console.log(websocketMessage.data.author_id)
          console.log(currUser!.id)
          if (
            websocketMessage.data.article_id === selectedArticle?.article_id &&
            websocketMessage.data.author_id !== currUser!.id
          ) {
            console.log("Comment transfer", websocketMessage);
            setComments(prevComments => [...prevComments, websocketMessage.data]);
          }
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
                friends: friends
              },
            })
          );
          newWs.close();
        }
      };
    }
    // eslint-disable-next-line
  }, [currUser, setMessages, selectedFriend]);

  const sendMessage = async (messageDraftContent) => {
    fetch(`${process.env.REACT_APP_HEROKU_URL}/message/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        UserID: `${currUser!.id}`,
        Email: `${currUser!.email}`,
      },
      body: JSON.stringify({
        sender_id: currUser!.id,
        receiver_id: prevSelectedFriend.current!.id,
        message: messageDraftContent,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(async (data) => {
        if (data) {
          const websocketMessage = {
            type: WS_CODE.MESSAGE_TRANSFER,
            data: {
              id: data.message.id,
              message: messageDraftContent,
              sender: data.message.sender,
              receiver: data.message.receiver,
              sentAt: data.message.sentAt,
            },
          };

          if (ws) {
            ws.send(JSON.stringify(websocketMessage));
          }
        }
        setMessageDraft("");
        const newLocallyDisplayedMessage = {
          id: data.message.id,
          message: messageDraft,
          sender: data.message.sender,
          receiver: data.message.receiver,
          sentAt: data.message.sentAt,
        };
        setMessages((prevMessages) => [
          ...prevMessages,
          newLocallyDisplayedMessage,
        ]);
      })
      .catch((error) => {
        console.error("Error sending message:", error.message);
      });
  };

  return (
    <div className="p-6 mt-2 flex flex-col">
      {selectedFriend ? (
        <>
          <h2 className="text-lg font-semibold mb-4">
            <span className="text-[28px]">
              {<RandomEmoji id={selectedFriend.id} />}
            </span>{" "}
            {selectedFriend.username}{" "}
          </h2>
          <div className="flex flex-col w-full h-[88vh]">
            <div
              className="flex-1 overflow-y-auto mb-5"
              style={{ maxHeight: "calc(100vh - 14rem)" }}
              ref={scrollableDivRef}
            >
              {messages.map((message, index) => {
                const showAuthor = message.sender.id !== prevAuthorID; // Check if the author is different from the previous one
                prevAuthorID = message.sender.id; // Update the previous author

                return (
                  <div key={index}>
                    {showAuthor && (
                      <div
                        key={index + "_author"}
                        className={`text-md mb-1 mt-4 font-bold ${
                          currUser!.id === message.sender.id
                            ? "text-teal-500"
                            : "text-violet-500"
                        }`}
                      >
                        {currUser!.id === message.sender.id
                          ? `${message.sender.username} (You)`
                          : `${message.sender.username}`}{" "}
                        <span className={`text-gray-500 text-xs font-medium`}>
                          {new Date(message.sentAt).toLocaleString("en-US", {
                            month: "2-digit",
                            day: "2-digit",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                      </div>
                    )}
                    <div
                      key={index + "_content"}
                      className={"flex items-start justify-start"}
                    >
                      <div className={`rounded-lg max-w-3xl break-words gray`}>
                        <div className="text-sm text-gray-700">
                          {message.message}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="bg-gray-200 rounded-lg flex items-center justify-between p-6 h-28">
              <input
                type="text"
                placeholder="Type your message..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 mr-2 focus:outline focus:outline-teal-300"
                value={messageDraft}
                onChange={(e) => setMessageDraft(e.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    sendMessage(messageDraft);
                    setMessageDraft("");
                  }
                }}
              />
              <button
                className="w-20 bg-teal-500 text-white py-2 px-4 rounded-md hover:bg-teal-600"
                onClick={() => sendMessage(messageDraft)}
              >
                Send
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-500 flex-1 flex items-center justify-center">
          Select a friend to start chatting
        </div>
      )}
    </div>
  );
};
