import React, { useContext, useEffect, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import colors from "tailwindcss/colors";
import { GroupInvite, LoadingGroupInvite } from "../utils/Types.tsx";
import { bouncy } from "ldrs";
import { RandomEmoji, RandomGroupsEmoji } from "./RandomEmoji.tsx";
import { RiUserAddLine } from "react-icons/ri";
import { TokenContext, UserContext } from "../context/UserContextProvider.tsx";

export const GroupInvites = ({ toggleGroupInvites, triggerNotification }) => {
  const [groupInvites, setGroupInvites] = useState<LoadingGroupInvite[]>([]);
  const [loading, setLoading] = useState(false);
  const token = useContext(TokenContext);
  const currUser = useContext(UserContext);

  bouncy.register();

  useEffect(() => {
    getGroupInvites();
  }, []);

  const getGroupInvites = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_HEROKU_URL}/users/${currUser!.id}/invites`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            UserID: `${currUser!.id}`,
            Email: `${currUser!.email}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      if (data.success) {
        console.log("Group invites retrieved successfully:", data);
        const groupInvites = data.invites.map((invite) => ({
          id: invite.id,
          sender: {
            id: invite.sender.user_id,
            username: invite.sender.username,
            email: invite.sender.email,
            createdAt: new Date(invite.sender.created_at),
            muted: invite.sender.muted,
            role: invite.sender.role,
          },
          group: {
            id: invite.group.id,
            name: invite.group.name,
            dateCreated: new Date(invite.group.dateCreated),
            groupOwnerId: invite.group.groupOwnerId,
          },
          receiverID: invite.receiverId,
          accepted: invite.accepted,
          createdAt: new Date(invite.createdAt),
        }));

        const loadingGroupInvites = groupInvites.map((groupInvite) => ({
          invite: groupInvite,
          loading: false,
        }));

        setGroupInvites(loadingGroupInvites);
      } else {
        console.error("Error retrieving invites:", data.error);
        return null;
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      return null;
    }
  };

  const acceptGroupInvite = async (groupInvite: GroupInvite) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_HEROKU_URL}/invites/${groupInvite.id}/accept`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            UserID: `${currUser!.id}`,
            Email: `${currUser!.email}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      if (data.success) {
        triggerNotification(true, "Accepted invite successfully!");
        setGroupInvites((prevInvites) =>
          prevInvites.filter((req) => req.invite.id !== groupInvite.id)
        );
      } else {
        triggerNotification(false, "Error accepting invite");
      }
    } catch (error) {
      triggerNotification(false, "Error accepting invite");
      console.error("There was a problem with the fetch operation:", error);
      setLoading(false);
    }
    setLoading(false);
  };

  const rejectGroupInvite = async (groupInvite: GroupInvite) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_HEROKU_URL}/invites/${groupInvite.id}/decline`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            UserID: `${currUser!.id}`,
            Email: `${currUser!.email}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      if (data.success) {
        triggerNotification(false, "Invite declined!");
        setGroupInvites((prevInvites) =>
          prevInvites.filter((req) => req.invite.id !== groupInvite.id)
        );
      } else {
        triggerNotification(false, "Error declining invite");
      }
    } catch (error) {
      triggerNotification(false, "Error declining invite");
      console.error("There was a problem with the fetch operation:", error);
      setLoading(false);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white h-[90%] border-gray-300">
      <div className="pt-5 p-2 flex items-center justify-between">
        <div className="flex flex-row items-center">
          <button
            className="bg-transparent hover:bg-transparent w-10 h-10 pt-3 items-center justify-center"
            onClick={toggleGroupInvites}
          >
            <IoArrowBack color={colors.black} size={24} />
          </button>
          <h1 className="text-xl font-semibold ml-3">Group Invites</h1>
        </div>
        {loading ? (
          <div className="w-10 h-10 pt-3 mr-8 items-center justify-center">
            <l-bouncy size="35" speed="1.75" color={colors.teal[600]} />
          </div>
        ) : null}
      </div>
      <div>
        <div className="divide-y divide-gray-200">
          {/* Assuming `friendRequests` is an array of friend request objects */}
          {groupInvites.map((loadingGroupInvite) => (
            <div
              key={loadingGroupInvite.invite.id}
              className="px-4 pt-4 pb-2 flex justify-between items-center"
            >
              <div className="pb-2">
                <span className="text-xl mr-2">
                  {
                    <RandomGroupsEmoji
                      id={loadingGroupInvite.invite.group.id}
                    />
                  }
                </span>
                {loadingGroupInvite.invite.group.name}
              </div>
              <div className="flex space-x-1 w-1/2 h-10 items-center justify-center">
                {loadingGroupInvite.loading ? (
                  <div className="my-2">
                    <l-bouncy size="35" speed="1.75" color={colors.teal[600]} />
                  </div>
                ) : (
                  <div className="my-2 w-full flex flex-row">
                    <button
                      className="bg-teal-500 text-white text-sm w-20 py-2 ml-1 rounded-md hover:bg-teal-600"
                      onClick={() =>
                        acceptGroupInvite(loadingGroupInvite.invite)
                      }
                    >
                      Accept
                    </button>
                    <button
                      className="bg-rose-500 text-white text-sm w-20 py-2 ml-1 rounded-md hover:bg-rose-600"
                      onClick={() =>
                        rejectGroupInvite(loadingGroupInvite.invite)
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
