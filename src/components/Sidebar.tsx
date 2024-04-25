import React, { useContext } from "react";
import { Article, User } from "../utils/Types.tsx";
import { FriendsList } from "./FriendsList.tsx";
import { Link } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { TokenUpdateContext, UserUpdateContext } from "../context/UserContextProvider.tsx";
import { ArticleList } from "./ArticleList.tsx";

interface SidebarProps {
  selectedFriend: User | null;
  handleFriendSelect: (friend: User) => void;
  toggleFriendSearch: () => void;
  friends: User[];
  articles: Article[];
  selectedArticle: Article | null;
  handleArticleSelect: (article: Article) => void;
  getFriends: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedFriend,
  handleFriendSelect,
  toggleFriendSearch,
  friends,
  selectedArticle,
  handleArticleSelect,
  getFriends,
}) => {
  const setCurrUser = useContext(UserUpdateContext);
  const setToken = useContext(TokenUpdateContext);

  const handleLogout = () => {
    setCurrUser(null);
    setToken(null);
  };

  return (
    <div className="pr-1 w-1/4 min-w-80 border-r bg-white border-gray-300 shadow-lg">
      <FriendsList
        selectedFriend={selectedFriend}
        handleFriendSelect={handleFriendSelect}
        toggleFriendSearch={toggleFriendSearch}
        friends={friends}
        getFriends={getFriends}
      />
      <ArticleList
        selectedArticle={selectedArticle}
        handleArticleSelect={handleArticleSelect}
      />
      <Link
        className="ml-6 flex flex-row items-center"
        to="/"
        onClick={handleLogout}
      >
        <FiLogOut className="text-lg" />
        <span className="ml-2 text-lg">Logout</span>
      </Link>
    </div>
  );
};
