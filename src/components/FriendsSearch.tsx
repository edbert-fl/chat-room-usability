import React, { useContext, useEffect, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import colors from "tailwindcss/colors";
import { FriendRequest, LoadingRequest } from "../utils/Types";
import { TokenContext, UserContext } from "../context/UserContextProvider.tsx";
import { bouncy } from "ldrs";
import { RandomEmoji } from "./RandomEmoji.tsx";

interface FriendsSearchProps {
  toggleFriendSearch: () => void;
  triggerNotification: (success: boolean, message: string) => void;
}

export const FriendsSearch: React.FC<FriendsSearchProps> = ({
  toggleFriendSearch,
  triggerNotification,
}) => {
  const [friendRequests, setFriendRequests] = useState<LoadingRequest[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const currUser = useContext(UserContext);
  const token = useContext(TokenContext);

  bouncy.register();

  useEffect(() => {
    getFriendRequests();
    // eslint-disable-next-line
  }, []);

  const getFriendRequests = () => {
    handleFriendRequest(
      "user/get/friend-requests",
      { userID: currUser!.id },
      null,
      "Error fetching friend requests"
    );
  };

  const sendFriendRequest = (requestedUsername: string) => {
    handleFriendRequest(
      "friend/add",
      { sender_id: currUser!.id, friend_name: requestedUsername },
      "Friend request sent",
      "Error sending friend request"
    );
  };

  const acceptFriendRequest = (request: FriendRequest) => {
    handleFriendRequest(
      "friend/accept",
      { request_id: request.id },
      "Friend request accepted",
      "Error accepting friend request"
    );
  };

  const rejectFriendRequest = (request: FriendRequest) => {
    handleFriendRequest(
      "friend/reject",
      { request_id: request.id },
      "Friend request rejected",
      "Error rejecting friend request"
    );
  };

  const handleFriendRequest = (
    endpoint,
    requestData,
    successMessage,
    errorMessage
  ) => {
    setLoading(true);
    fetch(`${process.env.REACT_APP_HEROKU_URL}/${endpoint}`, {
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
          return response.json().then((data) => {
            if (data.error) {
              triggerNotification(false, `${data.error}`);
            } else {
              triggerNotification(false, errorMessage);
            }
          });
        }
        return response.json();
      })
      .then((data) => {
        if (!data) {
          return;
        }
        if (successMessage != null) {
          triggerNotification(true, successMessage);
        }
        if (endpoint === "friend/add") {
          getFriendRequests();
        } else if (endpoint === "user/get/friend-requests") {
          const loadingRequests = data.friendRequests.map((friendRequest) => ({
            request: friendRequest,
            loading: false,
          }));
          setFriendRequests(loadingRequests);
        } else if (
          endpoint === "friend/accept" ||
          endpoint === "friend/reject"
        ) {
          setFriendRequests((prevRequests) =>
            prevRequests.filter(
              (req) => req.request.id !== requestData.request_id
            )
          );
        }
      })
      .catch((error) => {
        console.error("Network error:", error);
        triggerNotification(false, "Network error");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSearch = () => {
    sendFriendRequest(searchText);
    setSearchText("");
  };

  return (
    <div
      className="w-full"
    >
      <div className="pt-5 flex items-center">
        <button
          className="bg-transparent hover:bg-transparent w-10 h-10 pt-3 items-center justify-center"
          onClick={toggleFriendSearch}
        >
          <IoArrowBack color={colors.black} size={24} />
        </button>
        <h1 className="text-xl font-semibold ml-3">Friend Requests</h1>
      </div>
      <div>
        <div className="p-4 flex flex-row items-center">
          <input
            type="text"
            placeholder="Search for friends"
            className="border border-gray-300 p-2 rounded-md h-10 w-3/4 focus:outline focus:outline-teal-300"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSearch();
              }
            }}
          />
          <div className=" flex justify-center items-center">
            {loading ? (
              <l-bouncy size="35" speed="1.75" color={colors.teal[600]} />
            ) : (
              <button
                className="bg-teal-500 text-white text-sm h-10 py-3 ml-1 flex items-center rounded-md hover:bg-teal-600"
                onClick={handleSearch}
              >
                Search
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {/* Assuming `friendRequests` is an array of friend request objects */}
          {friendRequests.map((loadingRequest) => (
            <div
              key={loadingRequest.request.id}
              className="px-4 pt-4 pb-2 flex justify-between items-center"
            >
              <div>
                <span className="text-xl mr-2">
                  {<RandomEmoji id={loadingRequest.request.sender.id} />}
                </span>
                {loadingRequest.request.sender.username}
              </div>
              <div className="flex space-x-1 w-1/2 h-10 items-center justify-center">
                {loadingRequest.loading ? (
                  <div className="my-2">
                    <l-bouncy size="35" speed="1.75" color={colors.teal[600]} />
                  </div>
                ) : (
                  <div className="my-2 w-full flex flex-row">
                    <button
                      className="bg-teal-500 text-white text-sm w-20 py-2 ml-1 rounded-md hover:bg-teal-600"
                      onClick={() =>
                        acceptFriendRequest(loadingRequest.request)
                      }
                    >
                      Accept
                    </button>
                    <button
                      className="bg-rose-500 text-white text-sm w-20 py-2 ml-1 rounded-md hover:bg-rose-600"
                      onClick={() =>
                        rejectFriendRequest(loadingRequest.request)
                      }
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
