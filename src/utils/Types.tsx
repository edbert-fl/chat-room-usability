export interface Message {
  id: number;
  sender: User;
  receiver: User;
  message: string;
  sentAt: Date;
}

export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: Date;
}

export interface FriendRequest {
  id: number;
  sender: User;
  receiverID: number;
  accepted: boolean;
  createdAt: Date;
}

export interface Notification {
  id: number;
  success: boolean;
  message: string;
}

export interface LoadingRequest {
  request: FriendRequest;
  loading: boolean;
}

export interface encryptedData {
  encryptedData: ArrayBuffer;
  iv: Uint8Array;
  hmac: ArrayBuffer;
}

export interface ChatRoomConnection {
  friendID: number;
  publicKey: CryptoKey | null;
  privateKey: CryptoKey;
}

export interface PKDF2Keys {
  encryptionKey: CryptoKey;
  hmacKey: CryptoKey;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  author: User;
  date: Date;
}

export interface ArticleComment {
  id: number;
  articleId: number;
  content: string;
  author: User;
  datePosted: Date;
}

export const dateTimeFormat = "MM/DD/YYYY h:mm A";
