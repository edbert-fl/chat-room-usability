import { FriendsListHeader } from "./FriendsListHeader.tsx";
import React, { useContext, useState } from "react";
import { Article, Group, User } from "../utils/Types.tsx";
import { FriendsList } from "./FriendsList.tsx";
import { Link } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import {
  TokenUpdateContext,
  UserContext,
  UserUpdateContext,
} from "../context/UserContextProvider.tsx";
import { ArticleList } from "./ArticleList.tsx";
import { GroupsList } from "./GroupsList.tsx";
import { FriendsSearch } from "./FriendsSearch.tsx";
import { GroupInvites } from "./GroupInvites.tsx";
import { WebSocketContext } from "../context/WebSocketContextProvider.tsx";
interface SidebarProps {
  selectedFriend: User | null;
  handleFriendSelect: (friend: User) => void;
  groups: Group[];
  getGroups: () => void;
  selectedGroup: Group | null;
  handleGroupSelect: (group: Group) => void;
  friends: User[];
  articles: Article[];
  selectedArticle: Article | null;
  handleArticleSelect: (article: Article) => void;
  getFriends: () => void;
  toggleCreateArticleScreen: () => void;
  triggerNotification: (success: boolean, message: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedFriend,
  handleFriendSelect,
  groups,
  getGroups,
  selectedGroup,
  handleGroupSelect,
  friends,
  selectedArticle,
  handleArticleSelect,
  getFriends,
  toggleCreateArticleScreen,
  triggerNotification,
}) => {
  const setCurrUser = useContext(UserUpdateContext);
  const setToken = useContext(TokenUpdateContext);
  const currUser = useContext(UserContext);
  const ws = useContext(WebSocketContext);

  const [navigationMenuIsOpen, setNavigationMenuIsOpen] = useState(true);
  const [socialMenuIsOpen, setSocialMenuIsOpen] = useState(false);
  const [articleMenuIsOpen, setArticleMenuIsOpen] = useState(false);
  const [groupsMenuIsOpen, setGroupsMenuIsOpen] = useState(false);

  const [friendSearchIsOpen, setFriendSearchIsOpen] = useState(false);
  const [groupInvitesIsOpen, setGroupInvitesIsOpen] = useState(false);

  const handleLogout = () => {
    setCurrUser(null);
    setToken(null);
    ws?.close();
  };

  const toggleSocialMenu = () => {
    if (socialMenuIsOpen) {
      setSocialMenuIsOpen(false);
      setNavigationMenuIsOpen(true);
    } else {
      setSocialMenuIsOpen(true);
      setNavigationMenuIsOpen(false);
    }

    setArticleMenuIsOpen(false);
    setGroupsMenuIsOpen(false);
  };

  const toggleArticlesMenu = () => {
    if (articleMenuIsOpen) {
      setArticleMenuIsOpen(false);
      setNavigationMenuIsOpen(true);
    } else {
      setArticleMenuIsOpen(true);
      setNavigationMenuIsOpen(false);
    }

    setSocialMenuIsOpen(false);
    setGroupsMenuIsOpen(false);
  };

  const toggleGroupsMenu = () => {
    if (groupsMenuIsOpen) {
      setGroupsMenuIsOpen(false);
      setNavigationMenuIsOpen(true);
    } else {
      setGroupsMenuIsOpen(true);
      setNavigationMenuIsOpen(false);
    }

    setSocialMenuIsOpen(false);
    setArticleMenuIsOpen(false);
  };

  const toggleFriendSearch = () => {
    if (friendSearchIsOpen && socialMenuIsOpen) {
      getFriends();
      setFriendSearchIsOpen(false);
    } else {
      setFriendSearchIsOpen(true);
    }
  };

  const toggleGroupInvites = () => {
    console.log(groupInvitesIsOpen);
    if (groupInvitesIsOpen && groupsMenuIsOpen) {
      getGroups();
      setGroupInvitesIsOpen(false);
    } else {
      setGroupInvitesIsOpen(true);
    }
  };

  return (
    <div className="flex-2 w-1/4">
      <div className="w-full border-r bg-white border-gray-300 shadow-lg h-full">
        <div className="flex flex-col h-[90%] w-auto">
          {navigationMenuIsOpen ? (
            <div className="w-full h-full">
              <div className="items-center">
                <h1 className="text-xl ml-6 mt-8 mb-4 font-semibold">
                  Welcome {currUser!.username}
                </h1>
                <ul>
                  <li
                    className={`cursor-pointer py-2 my-1 px-4 mx-2 rounded-md hover:bg-gray-100`}
                    onClick={() => toggleSocialMenu()}
                  >
                    <span className="text-xl mr-2">🌁</span> Social
                  </li>
                  <li
                    className={`cursor-pointer py-2 my-1 px-4 mx-2 rounded-md hover:bg-gray-100`}
                    onClick={() => toggleGroupsMenu()}
                  >
                    <span className="text-xl mr-2">🌅</span> Groups
                  </li>
                  <li
                    className={`cursor-pointer py-2 my-1 px-4 mx-2 ounded-md hover:bg-gray-100`}
                    onClick={() => toggleArticlesMenu()}
                  >
                    <span className="text-xl mr-2">🌉</span> Articles
                  </li>
                </ul>
              </div>
            </div>
          ) : null}

          {socialMenuIsOpen && !friendSearchIsOpen ? (
            <div className="w-full">
              <FriendsListHeader
                toggleFriendSearch={toggleFriendSearch}
                toggleSocialMenu={toggleSocialMenu}
              />
              <FriendsList
                selectedFriend={selectedFriend}
                handleFriendSelect={handleFriendSelect}
                friends={friends}
                getFriends={getFriends}
              />
            </div>
          ) : null}

          {groupsMenuIsOpen && !groupInvitesIsOpen ? (
            <div className="w-full">
              <GroupsList
                groups={groups}
                getGroups={getGroups}
                selectedGroup={selectedGroup}
                handleGroupSelect={handleGroupSelect}
                toggleGroupsMenu={toggleGroupsMenu}
                toggleGroupInvites={toggleGroupInvites}
              />
            </div>
          ) : null}

          {articleMenuIsOpen ? (
            <div className="w-full">
              <ArticleList
                selectedArticle={selectedArticle}
                handleArticleSelect={handleArticleSelect}
                toggleArticlesMenu={toggleArticlesMenu}
                toggleCreateArticleScreen={toggleCreateArticleScreen}
                triggerNotification={triggerNotification}
              />
            </div>
          ) : null}

          {friendSearchIsOpen ? (
            <div className="w-full">
              <FriendsSearch
                toggleFriendSearch={toggleFriendSearch}
                triggerNotification={triggerNotification}
              />
            </div>
          ) : null}

          {groupInvitesIsOpen ? (
            <div className="w-full">
              <GroupInvites
                toggleGroupInvites={toggleGroupInvites}
                triggerNotification={triggerNotification}
              />
            </div>
          ) : null}
        </div>
        <Link
          className="ml-6 flex flex-row items-center"
          to="/"
          onClick={handleLogout}
        >
          <FiLogOut className="text-lg" />
          <span className="ml-2 text-lg">Logout</span>
        </Link>
      </div>
    </div>
  );
};
