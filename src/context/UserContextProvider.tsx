import React, {
  createContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";
import { User } from "../utils/Types";
import Cookies from "js-cookie";

interface UserContextProviderProps {
  children: ReactNode;
}

export const UserContext = createContext<User | null>(null);
export const UserUpdateContext = createContext<
  Dispatch<SetStateAction<User | null>>
>(() => null);
export const TokenContext = createContext<string | null>(null);
export const TokenUpdateContext = createContext<
  Dispatch<SetStateAction<string | null>>
>(() => null);
const UserContextProvider = ({ children }: UserContextProviderProps) => {
  const [currUser, setCurrUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    async function setContextValuesFromCookies() {
      const userDataFromCookie = Cookies.get("currUser");
      const sessionTokenFromCookie = Cookies.get("sessionToken");

      if (userDataFromCookie && sessionTokenFromCookie) {
        const parsedUserData = JSON.parse(userDataFromCookie);
        setCurrUser(parsedUserData);
        setToken(sessionTokenFromCookie);
      }
    }
    setContextValuesFromCookies();
  }, []);

  useEffect(() => {
    if (currUser) {
      Cookies.set("currUser", JSON.stringify(currUser), { expires: 1 });
    } else {
      Cookies.remove("currUser");
    }
  }, [currUser]);

  useEffect(() => {
    if (token) {
      Cookies.set("sessionToken", token, { expires: 1 });
    } else {
      Cookies.remove("sessionToken");
    }
  }, [token]);

  return (
    <UserContext.Provider value={currUser}>
      <UserUpdateContext.Provider value={setCurrUser}>
        <TokenContext.Provider value={token}>
          <TokenUpdateContext.Provider value={setToken}>
            {children}
          </TokenUpdateContext.Provider>
        </TokenContext.Provider>
      </UserUpdateContext.Provider>
    </UserContext.Provider>
  );
};

export default UserContextProvider;
