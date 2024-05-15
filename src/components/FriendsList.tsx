import React, { useContext, useEffect, useState } from "react";
import { User } from "../utils/Types.tsx";
import { RandomEmoji } from "./RandomEmoji.tsx";
import { TokenContext, UserContext } from "../context/UserContextProvider.tsx";
import { FaCircle, FaTimes, FaTrash } from "react-icons/fa";
import colors from "tailwindcss/colors";

interface FriendsListProps {
  selectedFriend: User | null;
  handleFriendSelect: (friend: User) => void;
  friends: User[];
  getFriends: () => void;
}

export const FriendsList: React.FC<FriendsListProps> = ({
  selectedFriend,
  handleFriendSelect,
  friends,
  getFriends,
}) => {
  useEffect(() => {
    getFriends();
  }, []);
  const token = useContext(TokenContext);
  const currUser = useContext(UserContext);
  const [loading, setLoading] = useState(false);

  const deleteFriend = (friendID) => {
    const endpoint = "friend/delete";
    const url = `${process.env.REACT_APP_HEROKU_URL}/${endpoint}`;

    // The payload to be sent to the server
    const requestData = {
      user1Id: currUser!.id,
      user2Id: friendID,
    };

    setLoading(true);

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        UserID: `${currUser!.id}`,
        Email: `${currUser!.email}`,
      },
      body: JSON.stringify(requestData),
    })
      .then((response) => response.json())
      .then((result) => {
        setLoading(false);
        if (result.success) {
          console.log("Friend deleted successfully:", result);
        } else {
          console.error("Error deleting friend:", result.error);
        }
      })
      .catch((error) => {
        setLoading(false);
        console.error("Network error:", error);
      });
    getFriends();
  };

  return (
    <div className="w-full px-2 flex justify-between h-max-[90%] mt-2">
      <ul className="h-[90%] w-full ">
        {friends.map((friend) => (
          <li
            key={friend.id}
            className={`cursor-pointer py-2 px-4 my-1 rounded-md ${
              selectedFriend && selectedFriend.id === friend.id
                ? "bg-teal-100"
                : "hover:bg-slate-100"
            }`}
            onClick={() => handleFriendSelect(friend)}
          >
            <div className="flex flex-row justify-between">
              <div className="flex flex-row">
                {friend.online ? (
                  <FaCircle
                    size={9}
                    className={`text-green-500 shadow-white shadow-lg mt-[.375rem] mr-2`}
                  />
                ) : (
                  <FaCircle
                    size={9}
                    className={`text-gray-500 shadow-white shadow-lg mt-[.375rem] mr-2`}
                  />
                )}
                {<RandomEmoji id={friend.id} />} {friend.username}
              </div>
              <div>
                {friend.id === selectedFriend?.id ? (
                  <button
                    className="p-0 pt-[0.35rem] m-0 bg-transparent flex align-top hover:bg-transparent text-2xl"
                    onClick={() => deleteFriend(friend.id)}
                  >
                    <FaTrash
                      size={13}
                      className="text-teal-700 hover:text-teal-600"
                    />
                  </button>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
