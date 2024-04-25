import { ArticleComment } from "../utils/Types"; // Import the Comment type if available

const mockComments: ArticleComment[] = [
  {
    id: 1,
    articleId: 1,
    content: "Great article!",
    author: {
      id: 3,
      username: "Jane Smith",
      email: "janesmith@example.com",
      createdAt: new Date(),
    },
    datePosted: new Date(),
  },
  {
    id: 2,
    articleId: 1,
    content: "Interesting points!",
    author: {
      id: 4,
      username: "Max Johnson",
      email: "maxjohnson@example.com",
      createdAt: new Date(),
    },
    datePosted: new Date(),
  },
];

export class CommentService {
  static async getCommentsForArticle(articleId: number): Promise<ArticleComment[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const commentsForArticle = mockComments.filter(
          (comment) => comment.articleId === articleId
        );
        resolve(commentsForArticle);
      }, 1000);
    });
  }

  static async addComment(comment: ArticleComment): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockComments.push(comment);
        resolve(); 
      }, 500);
    });
  }
}
