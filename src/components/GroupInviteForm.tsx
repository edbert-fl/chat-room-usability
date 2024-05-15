import React, { useContext, useState } from "react";
import { FaTimes } from "react-icons/fa";
import colors from "tailwindcss/colors";
import { TokenContext, UserContext } from "../context/UserContextProvider.tsx";

const GroupInviteForm = ({ toggleGroupInviteFormIsOpen, selectedGroup, triggerNotification}) => {
  const [friendToInvite, setFriendToInvite] = useState("");
  const token = useContext(TokenContext);
  const currUser = useContext(UserContext);

  const inviteFriendToGroup = async () => {
    const requestData = {
      senderId: currUser!.id,
      receiverName: friendToInvite,
    };
  
    try {
      const response = await fetch(`${process.env.REACT_APP_HEROKU_URL}/groups/${selectedGroup.id}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          UserID: `${currUser!.id}`,
          Email: `${currUser!.email}`,
        },
        body: JSON.stringify(requestData),
      });
  
      if (!response.ok) {
        if (response.status === 401) {
          triggerNotification(false, "Unauthorized access");
          return;
        } else {
          triggerNotification(false, "Network response was not ok");
          return;
        }
      }
  
      const data = await response.json();
      if (data.success) {
        triggerNotification(true, "Invite sent successfully");
        toggleGroupInviteFormIsOpen();
        return;
      } else {
        triggerNotification(false, "Error sending invite!");
        console.error("Error sending invite:", data.error);
        return;
      }
    } catch (error) {
      triggerNotification(false, "Error sending invite!");
      console.error("There was a problem with the fetch operation:", error);
    }
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
      <div className="bg-white p-4 mb-52 rounded-md shadow-md w-full max-w-lg mx-auto">
        <div className="pt-2 pl-2 pr-2 items-center">
          <div className="flex justify-between pb-3">
            <h2 className="font-semibold pt-2">
              Invite a friend to {selectedGroup.name}
            </h2>
            <button
              className="w-9 bg-transparent flex align-top hover:bg-transparent text-2xl text-gray-600 hover:text-gray-800"
              onClick={toggleGroupInviteFormIsOpen}
            >
              <FaTimes size={18} color={colors.black} />
            </button>
          </div>
          <div className="flex flex-row">
            <input
              type="text"
              placeholder="Search for friend"
              className="border border-gray-300 p-2 rounded-md h-10 w-3/4 focus:outline focus:outline-teal-300"
              value={friendToInvite}
              onChange={(event) => setFriendToInvite(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  inviteFriendToGroup();
                }
              }}
            />
            <div className="flex justify-center items-center ml-2">
              <button
                className="bg-teal-500 text-white text-sm h-10 py-3 flex items-center rounded-md hover:bg-teal-600"
                onClick={inviteFriendToGroup}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupInviteForm;
