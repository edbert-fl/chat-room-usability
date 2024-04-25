import React, {
  createContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
  useEffect,
  useContext,
} from "react";
import { User } from "../utils/Types";
import Cookies from "js-cookie";
import { generateKeyPair } from "../utils/WSCrypto.tsx";
import { ChatRoomConnectionContext } from "./EncryptionContextProvider.tsx";
import { pbkdf2KeyToString, stringToPbkdf2Key } from "../utils/PKDFCrypto.tsx";

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

  const { setPublicKey, setPrivateKey, PKDF2Key, setPKDF2Key } = useContext(
    ChatRoomConnectionContext
  );

  useEffect(() => {
    async function setContextValuesFromCookies() {
      const userDataFromCookie = Cookies.get("currUser");
      const sessionTokenFromCookie = Cookies.get("sessionToken");
      const PKDF2KeyFromCookie = Cookies.get("PKDF2Key");

      if (userDataFromCookie && sessionTokenFromCookie && PKDF2KeyFromCookie) {
        const parsedUserData = JSON.parse(userDataFromCookie);
        const pkdf2Key = await stringToPbkdf2Key(JSON.parse(PKDF2KeyFromCookie));
        setCurrUser(parsedUserData);
        setToken(sessionTokenFromCookie);
        setPKDF2Key(pkdf2Key);
      }
    }
    setContextValuesFromCookies();
  }, [setPKDF2Key]);

  useEffect(() => {
    if (currUser) {
      Cookies.set("currUser", JSON.stringify(currUser), { expires: 1 });
    } else {
      Cookies.remove("currUser");
    }
  }, [currUser]);

  useEffect(() => {
    async function savePKDF2KeyToCookie() {
      if (PKDF2Key) {
        const PKDF2KeyString = await pbkdf2KeyToString(PKDF2Key);
        Cookies.set("PKDF2Key", JSON.stringify(PKDF2KeyString), { expires: 1 });
      } else {
        Cookies.remove("PKDF2Key");
      }
    }

    savePKDF2KeyToCookie();
  }, [PKDF2Key]);

  useEffect(() => {
    async function setKeyPairs() {
      const generatedKeyPair = await generateKeyPair();
      setPrivateKey(generatedKeyPair.privateKey);
      setPublicKey(generatedKeyPair.publicKey);
    }

    if (token) {
      Cookies.set("sessionToken", token, { expires: 1 });
      setKeyPairs();
    } else {
      Cookies.remove("sessionToken");
    }
  }, [token, setPublicKey, setPrivateKey]);

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
