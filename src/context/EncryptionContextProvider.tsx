import React, {
  createContext,
  useState,
  ReactNode,
  SetStateAction,
  Dispatch,
  useEffect,
} from "react";
import { PKDF2Keys } from "../utils/Types";

interface EncryptionContextProviderProps {
  children: ReactNode;
}

export interface ChatRoomConnectionContextType {
  publicKey: CryptoKey | null;
  setPublicKey: Dispatch<SetStateAction<CryptoKey | null>>;
  friendsPublicKey: CryptoKey | null;
  setFriendsPublicKey: Dispatch<SetStateAction<CryptoKey | null>>;
  privateKey: CryptoKey | null;
  setPrivateKey: Dispatch<SetStateAction<CryptoKey | null>>;
  PKDF2Key: PKDF2Keys | null;
  setPKDF2Key: Dispatch<SetStateAction<PKDF2Keys | null>>;
}

export const ChatRoomConnectionContext =
  createContext<ChatRoomConnectionContextType>({
    publicKey: null,
    setPublicKey: () => {},
    friendsPublicKey: null,
    setFriendsPublicKey: () => {},
    privateKey: null,
    setPrivateKey: () => {},
    PKDF2Key: null,
    setPKDF2Key: () => {},
  });

export const EncryptionContextProvider = ({
  children,
}: EncryptionContextProviderProps) => {
  const [publicKey, setPublicKey] = useState<CryptoKey | null>(null);
  const [friendsPublicKey, setFriendsPublicKey] = useState<CryptoKey | null>(
    null
  );
  const [privateKey, setPrivateKey] = useState<CryptoKey | null>(null);
  const [PKDF2Key, setPKDF2Key] = useState<PKDF2Keys | null>(null);

  useEffect(() => {
    console.log("Private key has been set");
  }, [setPrivateKey]);

  useEffect(() => {
    console.log("Public key has been set");
  }, [setPublicKey]);

  useEffect(() => {
    console.log("Friend's Public key has been set");
  }, [setFriendsPublicKey]);

  useEffect(() => {
    console.log("PBKDF2 key has been set");
  }, [setPKDF2Key]);

  // useEffect(() => {
  //   async function fetchKeyFromCookie() {
  //     const pkdfKeyFromCookie = Cookies.get("PKDF2Key");
  //     if (pkdfKeyFromCookie) {
  //       const pkdfKey = await stringToPbkdf2Key(pkdfKeyFromCookie);
  //       setPKDF2Key(pkdfKey);
  //     }
  //   }

  //   fetchKeyFromCookie();
  // }, []);

  // useEffect(() => {
  //   async function setKeyAsCookie() {
  //     if (PKDF2Key) {
  //       Cookies.set("PKDF2Key", await pbkdf2KeyToString(PKDF2Key), { expires: 1 });
  //     } else {
  //       Cookies.remove("PKDF2Key");
  //     }
  //   }

  //   setKeyAsCookie();
  // }, [PKDF2Key]);

  const contextValue: ChatRoomConnectionContextType = {
    publicKey,
    setPublicKey,
    friendsPublicKey,
    setFriendsPublicKey,
    privateKey,
    setPrivateKey,
    PKDF2Key,
    setPKDF2Key,
  };

  return (
    <ChatRoomConnectionContext.Provider value={contextValue}>
      {children}
    </ChatRoomConnectionContext.Provider>
  );
};

export default EncryptionContextProvider;
