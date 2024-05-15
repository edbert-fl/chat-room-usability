import React, { useContext, useState } from "react";
import { IoArrowBack } from "react-icons/io5";
import colors from "tailwindcss/colors";
import { RandomGroupsEmoji } from "./RandomEmoji.tsx";
import { RiUserAddLine } from "react-icons/ri";
import { TokenContext, UserContext } from "../context/UserContextProvider.tsx";
import { Group } from "../utils/Types.tsx";

export const GroupsList = ({
  groups,
  getGroups,
  selectedGroup,
  handleGroupSelect,
  toggleGroupsMenu,
  toggleGroupInvites,
}) => {
  const [groupsListLoading, setGroupsListLoading] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const currUser = useContext(UserContext);
  const token = useContext(TokenContext);

  const createGroup = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_HEROKU_URL}/groups/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "UserID": `${currUser!.id}`,
          "Email": `${currUser!.email}`,
        },
        body: JSON.stringify({
          name: newGroupName,
          groupOwnerId: currUser!.id,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
  
      const result = await response.json();
      console.log('Group created:', result);
      setNewGroupName("");
      getGroups();
    } catch (error) {
      console.error("Error creating group:", error.message);
    }
  };


  return (
    <>
      <div id="groupList" className="pt-5 p-2 flex justify-between">
        <div className="flex items-center">
          <button
            className="bg-transparent hover:bg-transparent w-10 h-10 items-center justify-center"
            onClick={toggleGroupsMenu}
          >
            <IoArrowBack color={colors.black} size={24} />
          </button>
          <h1 className="text-xl font-semibold ml-3">Groups</h1>
        </div>
        <button
          className="bg-transparent hover:bg-transparent w-10 h-10 pt-3 px-10 items-center justify-center"
          onClick={toggleGroupInvites}
        >
          <RiUserAddLine size={24} color={colors.black} />
        </button>
      </div>

      <div className="pt-2 pl-2 pr-2 flex flex-row items-center">
        <input
          type="text"
          placeholder="Create a new group"
          className="border border-gray-300 p-2 rounded-md h-10 w-3/4 focus:outline focus:outline-teal-300"
          value={newGroupName}
          onChange={(event) => setNewGroupName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              createGroup();
            }
          }}
        />
        <div className=" flex justify-center items-center">
          <button
            className="bg-teal-500 text-white text-sm h-10 py-3 ml-1 flex items-center rounded-md hover:bg-teal-600"
            onClick={createGroup}
          >
            Create
          </button>
        </div>
      </div>

      {groupsListLoading ? (
        <div className="h-[90%]">
          {/* TODO: Placeholder for loading state */}
        </div>
      ) : (
        <ul className="h-[90%]">
          {(groups as Group[]).map((group) => (
            <li
              key={group.id}
              className={`cursor-pointer py-2 px-4 mx-2 mt-1 rounded-md ${
                selectedGroup && selectedGroup.id === group.id
                  ? "bg-teal-100"
                  : "hover:bg-slate-100"
              }`}
              onClick={() => handleGroupSelect(group)}
            >
              <span className="text-xl">
                {<RandomGroupsEmoji id={group.id} />}
              </span>{" "}
              {group.name}
            </li>
          ))}
        </ul>
      )}
    </>
  );
};
