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
  muted: boolean;
  role: number;
  online?: boolean;
}

export interface FriendRequest {
  id: number;
  sender: User;
  receiverID: number;
  accepted: boolean;
  createdAt: Date;
}

export interface GroupInvite {
  id: number;
  sender: User;
  group: Group;
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

export interface LoadingGroupInvite {
  invite: GroupInvite;
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
  article_id: number;
  sponsored_by: string;
  title: string;
  content: string;
  author: User;
  date: Date;
  anonymous: boolean;
  endorsed: boolean;
}

export interface ArticleComment {
  comment_id: number;
  author_id: number;
  articleId: number;
  content: string;
  author: User;
  written_at: Date;
}

export interface Group {
  id: number;
  name: string;
  dateCreated: Date;
  groupOwner: User;
  members: User[];
}

export const dateTimeFormat = "MM/DD/YYYY h:mm A";
