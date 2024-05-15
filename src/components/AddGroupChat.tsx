import React from "react";
import { IoArrowBack } from "react-icons/io5";
import colors from "tailwindcss/colors";

interface AddGroupChatProps {
  friendSearchIsOpen: boolean;
  toggleFriendSearch: () => void;
  triggerNotification: (success: boolean, message: string) => void;
}

export const AddGroupChat: React.FC<AddGroupChatProps> = ({
  friendSearchIsOpen,
  toggleFriendSearch,
  triggerNotification,
}) => {

  return (
    <div
      className={`fixed z-10 inset-y-0 left-0 border-r bg-white pr-5 w-1/4 min-w-80 border-gray-300 ${
        friendSearchIsOpen
          ? "transition-all duration-300 ease-in-out transform translate-x-0"
          : "transition-all duration-300 ease-in-out transform -translate-x-full"
      }`}
    >
      <div className="pt-5 p-2 flex items-center">
        <button
          className="bg-transparent hover:bg-transparent w-10 h-10 pt-3 items-center justify-center"
          onClick={toggleFriendSearch}
        >
          <IoArrowBack color={colors.black} size={24} />
        </button>
        <h1 className="text-xl font-semibold ml-3">Friend Requests</h1>
      </div>
      <div>
      </div>
    </div>
  );
};
