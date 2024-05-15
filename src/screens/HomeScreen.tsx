import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Article,
  ArticleComment,
  Group,
  Message,
  User,
} from "../utils/Types.tsx";
import { Notification } from "../utils/Types.tsx";
import NotificationStack from "../components/NotificationStack.tsx";
import { ChatRoom } from "../components/ChatRoom.tsx";
import {
  TokenContext,
  UserContext,
  UserUpdateContext,
} from "../context/UserContextProvider.tsx";
import { Sidebar } from "../components/Sidebar.tsx";
import { ArticleDisplay } from "../components/ArticleDisplay.tsx";
import { NewArticleEditor } from "../components/NewArticleEditor.tsx";
import { GroupChatRoom } from "../components/GroupChatRoom.tsx";
import { WebSocketContext } from "../context/WebSocketContextProvider.tsx";
import WS_CODE from "../utils/WebscoketCodes.tsx";
import { EditArticle } from "../components/EditArticle.tsx";
import { WSConnectionHandler } from "../components/WSConnectionHandler.tsx";

const HomeScreen = () => {
  const currUser = useContext(UserContext);
  const setCurrUser = useContext(UserUpdateContext);
  const token = useContext(TokenContext);

  const [addGroupChatFormIsOpen, setAddGroupChatFormIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const [friends, setFriends] = useState<User[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupMessages, setGroupMessages] = useState<Message[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<ArticleComment[]>([]);

  const [newArticleEditorIsOpen, setNewArticleEditorIsOpen] = useState(false);
  const [editArticleIsOpen, setEditArticleIsOpen] = useState(false);

  const ws = useContext(WebSocketContext);
  const friendsRef = useRef<User[]>([]);

  useEffect(() => {
    getGroups();
  }, []);

  useEffect(() => {
    friendsRef.current = friends;
  }, [friends]);

  useEffect(() => {
    const checkFriendsOnline = () => {
      if (ws?.readyState === ws?.OPEN) {
        ws?.send(
          JSON.stringify({
            type: WS_CODE.CHECK_ONLINE,
            data: {
              sender: currUser!.id,
              friends: JSON.stringify(friendsRef.current),
            },
          })
        );
      }
    };
    checkFriendsOnline();

    const intervalId = setInterval(checkFriendsOnline, 10000);
    return () => clearInterval(intervalId);
  }, [ws]);

  const getGroups = async () => {
    console.log(currUser);
    fetch(`${process.env.REACT_APP_HEROKU_URL}/users/${currUser!.id}/groups`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        UserID: `${currUser!.id}`,
        Email: `${currUser!.email}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        console.log(response);
        return response.json();
      })
      .then((data) => {
        console.log(data);
        setGroups(data.groups);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  const handleArticleSelect = (article: Article) => {
    setMessages([]);
    setSelectedFriend(null);
    setSelectedArticle(article);
    setNewArticleEditorIsOpen(false);
    setAddGroupChatFormIsOpen(false);
    setEditArticleIsOpen(false);
    setSelectedGroup(null);
  };

  const handleFriendSelect = async (friend: User) => {
    setSelectedFriend(friend);
    setNewArticleEditorIsOpen(false);

    setMessages([]);
    setSelectedArticle(null);
    getMessages(friend);
    setSelectedGroup(null);
    setEditArticleIsOpen(false);
  };

  const handleGroupSelect = (group: Group) => {
    setSelectedGroup(group);
    getGroupMessages(group.id);

    setMessages([]);
    setSelectedFriend(null);
    setSelectedArticle(null);
    setAddGroupChatFormIsOpen(false);
    setEditArticleIsOpen(false);
  };

  const toggleCreateArticleScreen = () => {
    if (newArticleEditorIsOpen) {
      setNewArticleEditorIsOpen(false);
    } else {
      setNewArticleEditorIsOpen(true);
    }
  };

  const toggleEditArticleScreen = () => {
    if (editArticleIsOpen) {
      setEditArticleIsOpen(false);
    } else {
      setEditArticleIsOpen(true);
    }
  };

  const triggerNotification = (success: boolean, message: string) => {
    const id = Date.now(); // Generate unique ID based on current time
    const newNotification = { id, success, message };
    setNotifications((prevNotifications) => [
      ...prevNotifications,
      newNotification,
    ]);
  };

  const getMessages = (friend: User) => {
    fetch(`${process.env.REACT_APP_HEROKU_URL}/message/get`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        UserID: `${currUser!.id}`,
        Email: `${currUser!.email}`,
      },
      body: JSON.stringify({
        user_id: currUser!.id,
        friend_id: friend!.id,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(async (data) => {
        setMessages(data.messages);
      })
      .catch((error) => {
        console.error(error.message);
      });
  };

  const getFriends = () => {
    const requestData = {
      userId: currUser!.id,
    };

    fetch(`${process.env.REACT_APP_HEROKU_URL}/user/get/friends`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        UserID: `${currUser!.id}`,
        Email: `${currUser!.email}`,
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        } else if (response.status === 401) {
          setCurrUser(null);
        }
        return response.json();
      })
      .then((data) => {
        const friendsArray: User[] = data.friends.map((friendship) => {
          const friend =
            friendship.user1.user_id !== currUser!.id
              ? friendship.user1
              : friendship.user2;
          return {
            id: friend.user_id,
            username: friend.username,
            email: friend.email,
            createdAt: friend.created_at,
          };
        });
        ws?.send(
          JSON.stringify({
            type: WS_CODE.CHECK_ONLINE,
            data: {
              sender: currUser!.id,
              friends: JSON.stringify(friendsArray),
            },
          })
        );
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  const getGroupMessages = (group_id) => {
    fetch(`${process.env.REACT_APP_HEROKU_URL}/groups/${group_id}/messages`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        UserID: `${currUser!.id}`,
        Email: `${currUser!.email}`,
      },
    })
      .then((response) => {
        if (response.status === 401) {
          setCurrUser(null);
        } else if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        const fomrattedMessages = data.messages.map((message) => ({
          id: message.id,
          sender: {
            id: message.sender.user_id,
            username: message.sender.username,
            email: message.sender.email,
            createdAt: new Date(message.sender.created_at),
            muted: message.sender.muted,
            role: message.sender.role,
            // Add other properties if needed
          },
          receiver: message.receiver,
          message: message.message,
          sentAt: new Date(message.sentAt),
        }));

        setGroupMessages(fomrattedMessages);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  return (
    <div className="h-full w-full bg-gray-50 flex flex-row">
      <WSConnectionHandler
        selectedFriend={selectedFriend}
        setMessages={setMessages}
        setGroupMessages={setGroupMessages}
        friends={friends}
        setFriends={setFriends}
        selectedArticle={selectedArticle}
        setComments={setComments}
        triggerNotification={triggerNotification}
      />
      <Sidebar
        groups={groups}
        getGroups={getGroups}
        selectedGroup={selectedGroup}
        handleGroupSelect={handleGroupSelect}
        friends={friends}
        handleFriendSelect={handleFriendSelect}
        selectedFriend={selectedFriend}
        getFriends={getFriends}
        articles={articles}
        handleArticleSelect={handleArticleSelect}
        selectedArticle={selectedArticle}
        toggleCreateArticleScreen={toggleCreateArticleScreen}
        triggerNotification={triggerNotification}
      />
      <div className="flex-1">
        <NotificationStack
          notifications={notifications}
          setNotifications={setNotifications}
        />
        {selectedArticle && !newArticleEditorIsOpen && !editArticleIsOpen ? (
          <ArticleDisplay
            selectedArticle={selectedArticle}
            toggleEditArticleScreen={toggleEditArticleScreen}
            comments={comments}
            setComments={setComments}
          />
        ) : newArticleEditorIsOpen ? (
          <NewArticleEditor handleArticleSelect={handleArticleSelect} />
        ) : editArticleIsOpen ? (
          <EditArticle
            handleArticleSelect={handleArticleSelect}
            articleToEdit={selectedArticle}
            toggleEditArticleScreen={toggleEditArticleScreen}
            triggerNotification={triggerNotification}
          />
        ) : selectedGroup ? (
          <GroupChatRoom
            selectedGroup={selectedGroup}
            groupMessages={groupMessages}
            setGroupMessages={setGroupMessages}
            triggerNotification={triggerNotification}
          />
        ) : (
          <ChatRoom
            selectedFriend={selectedFriend}
            messages={messages}
            setMessages={setMessages}
          />
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
