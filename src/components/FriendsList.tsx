import React, { useContext, useEffect, useState } from "react";
import { RiUserAddLine } from "react-icons/ri";
import colors from "tailwindcss/colors";
import { User } from "../utils/Types.tsx";
import RandomEmoji from "./RandomEmoji.tsx";
import { Link } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import {
  TokenUpdateContext,
  UserUpdateContext,
} from "../context/UserContextProvider.tsx";

interface FriendsListProps {
  selectedFriend: User | null;
  handleFriendSelect: (friend: User) => void;
  toggleFriendSearch: () => void;
  friends: User[];
  getFriends: () => void;
}

export const FriendsList: React.FC<FriendsListProps> = ({
  selectedFriend,
  handleFriendSelect,
  toggleFriendSearch,
  friends,
  getFriends,
}) => {
  const [friendListLoading, setFriendListLoading] = useState(false);

  useEffect(() => {
    setFriendListLoading(true);
    getFriends();
    setFriendListLoading(false);
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <div className="pt-5 p-4 mx-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold inline-block">Friends</h2>
        <button
          className="bg-transparent hover:bg-transparent w-10 h-10 pt-3 items-center justify-center"
          onClick={toggleFriendSearch}
        >
          <RiUserAddLine size={24} color={colors.black} />
        </button>
      </div>

      {friendListLoading ? (
        <div className="h-[80%]">
          <div className="animate-pulse p-5 flex h-10 w-4/5 space-x-4">
            <div className="flex-1 space-y-2 py-1">
              <div className="grid grid-cols-4 gap-1">
                <div className="h-5 bg-gray-200 rounded col-span-3"></div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <div className="h-5 bg-gray-200 rounded col-span-2"></div>
                <div className="h-5 bg-gray-200 rounded col-span-1"></div>
              </div>
              <div className="pt-5 grid grid-cols-5 gap-1">
                <div className="h-5 bg-gray-200 rounded col-span-3"></div>
                <div className="h-5 bg-gray-200 rounded col-span-1"></div>
              </div>
              <div className="grid grid-cols-6 gap-1">
                <div className="h-5 bg-gray-200 rounded col-span-1"></div>
                <div className="h-5 bg-gray-200 rounded col-span-3"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <ul className="h-[30%]">
          {friends.map((friend) => (
            <li
              key={friend.id}
              className={`cursor-pointer py-2 px-4 mx-2 my-1 rounded-md ${
                selectedFriend && selectedFriend.id === friend.id
                  ? "bg-teal-300"
                  : ""
              }
              ${
                selectedFriend && selectedFriend.id !== friend.id
                  ? "hover:bg-gray-100"
                  : ""
              }`}
              onClick={() => handleFriendSelect(friend)}
            >
              <span className="text-xl">{<RandomEmoji id={friend.id} />}</span>{" "}
              {friend.username}
            </li>
          ))}
        </ul>
      )}
    </>
  );
};
