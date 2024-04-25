// services/ArticleService.ts

import { Article } from "../utils/Types";

const mockArticles: Article[] = [
  {
    id: 1,
    title: "Lorem Ipsum",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    author: {
      id: 1,
      username: "Luna Atwood",
      email: "lunasworld@gmail.com",
      createdAt: new Date(),
    },
    date: new Date(),
  },
  {
    id: 2,
    title: "Another Article",
    content: "This is another article content...",
    author: {
      id: 2,
      username: "John Doe",
      email: "johndoe@gmail.com",
      createdAt: new Date(),
    },
    date: new Date(),
  },
];

export class ArticleService {
  static async getArticles(): Promise<Article[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockArticles);
      }, 1000);
    });
  }
}
