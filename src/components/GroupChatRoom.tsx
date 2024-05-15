import React, {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Group, Message, User } from "../utils/Types.tsx";
import { TokenContext, UserContext } from "../context/UserContextProvider.tsx";
import { RandomGroupsEmoji } from "./RandomEmoji.tsx";
import WS_CODE from "../utils/WebscoketCodes.tsx";
import {
  UpdateWebSocketContext,
  WebSocketContext,
} from "../context/WebSocketContextProvider.tsx";
import { ROLE, ROLE_COLORS } from "../utils/UserAccessLevels.tsx";
import colors from "tailwindcss/colors";
import { IoMdAdd } from "react-icons/io";
import GroupInviteForm from "./GroupInviteForm.tsx";

interface GroupChatRoomProps {
  selectedGroup: Group | null;
  groupMessages: Message[];
  setGroupMessages: Dispatch<SetStateAction<Message[]>>;
  triggerNotification: (success: boolean, message: string) => void;
}

export const GroupChatRoom: React.FC<GroupChatRoomProps> = ({
  selectedGroup,
  groupMessages,
  setGroupMessages,
  triggerNotification,
}) => {
  let prevAuthorID: number | null = null;

  const currUser = useContext(UserContext);
  const token = useContext(TokenContext);
  const ws = useContext(WebSocketContext);
  const setWs = useContext(UpdateWebSocketContext);

  const scrollableDivRef = useRef<HTMLDivElement>(null);

  const [messageDraft, setMessageDraft] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const sendMessageToGroup = async (messageDraftContent) => {
    fetch(
      `${process.env.REACT_APP_HEROKU_URL}/groups/${
        selectedGroup!.id
      }/message/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          UserID: `${currUser!.id}`,
          Email: `${currUser!.email}`,
        },
        body: JSON.stringify({
          senderId: currUser!.id,
          content: messageDraftContent,
        }),
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(async (data) => {
        if (data) {
          const websocketMessage = {
            type: WS_CODE.GROUP_MESSAGE_TRANSFER,
            receivers: selectedGroup!.members,
            data: data.message,
          };

          if (ws) {
            ws.send(JSON.stringify(websocketMessage));
          }

          setMessageDraft("");
          const formattedMessage = {
            id: data.message.id,
            message: data.message.message,
            receiver: data.message.receiver,
            sender: {
              id: data.message.sender.user_id,
              ...data.message.sender
            },
            sentAt: data.message.sentAt
          }
          setGroupMessages((prevMessages) => [...prevMessages, formattedMessage]);
        }
      })
      .catch((error) => {
        console.error("Error sending message:", error.message);
      });
  };

  const [groupInvitesFormIsOpen, setGroupInvitesFormIsOpen] = useState(false);

  const toggleGroupInviteFormIsOpen = () => {
    if (!groupInvitesFormIsOpen) {
      setGroupInvitesFormIsOpen(true);
    } else {
      setGroupInvitesFormIsOpen(false);
    }
  };

  return (
    <div className="p-6 mt-2 flex flex-col">
      {selectedGroup ? (
        <>
          {groupInvitesFormIsOpen ? (
            <GroupInviteForm
              toggleGroupInviteFormIsOpen={toggleGroupInviteFormIsOpen}
              selectedGroup={selectedGroup}
              triggerNotification={triggerNotification}
            />
          ) : null}
          <div className="w-full flex flex-row justify-between">
            <h2 className="text-lg font-semibold mb-4">
              <span className="text-[28px]">
                {<RandomGroupsEmoji id={selectedGroup.id} />}
              </span>{" "}
              {selectedGroup.name}{" "}
            </h2>
            <button
              className="bg-transparent hover:bg-transparent w-10 h-10 px-10 items-center justify-center"
              onClick={toggleGroupInviteFormIsOpen}
            >
              <IoMdAdd size={24} color={colors.black} />
            </button>
          </div>
          <div className="flex flex-col w-full h-[88vh]">
            <div
              className="flex-1 overflow-y-auto mb-5"
              style={{ maxHeight: "calc(100vh - 14rem)" }}
              ref={scrollableDivRef}
            >
              {groupMessages.map((message, index) => {
                const showAuthor = message.sender.id !== prevAuthorID; // Check if the author is different from the previous one
                prevAuthorID = message.sender.id; // Update the previous author
                return (
                  <div key={index}>
                    {showAuthor && (
                      <div
                        key={index + "_author"}
                        className={`text-md mb-1 mt-4 font-bold`}
                      >
                        <p style={{ color: ROLE_COLORS[message.sender.role] }}>
                          {currUser!.id === message.sender.id
                            ? `${message.sender.username} (You) · ${
                                ROLE[message.sender.role]
                              } ${" "}`
                            : `${message.sender.username} · ${
                                ROLE[message.sender.role]
                              } ${" "}`}
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
                        </p>
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
                    sendMessageToGroup(messageDraft);
                  }
                }}
              />
              <button
                className="w-20 bg-teal-500 text-white py-2 px-4 rounded-md hover:bg-teal-600"
                onClick={() => sendMessageToGroup(messageDraft)}
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
