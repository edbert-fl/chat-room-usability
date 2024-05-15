import React from "react";
import { IoArrowBack } from "react-icons/io5";
import { RiUserAddLine } from "react-icons/ri";
import colors from "tailwindcss/colors";

export function FriendsListHeader({ toggleFriendSearch, toggleSocialMenu }) {
  return (
    <>
      <div className="pt-5 w-full px-2 flex justify-between">
        <div className="flex items-center">
          <button
            className="bg-transparent hover:bg-transparent w-10 h-10 pt-3 items-center justify-center"
            onClick={toggleSocialMenu}
          >
            <IoArrowBack color={colors.black} size={24} />
          </button>
          <h1 className="text-xl font-semibold ml-3">Friends</h1>
        </div>
        <div className="flex flex-row">
          <button
            className="bg-transparent hover:bg-transparent w-10 h-10 pt-3 px-10 items-center justify-center"
            onClick={toggleFriendSearch}
          >
            <RiUserAddLine size={24} color={colors.black} />
          </button>
        </div>
      </div>
    </>
  );
}
