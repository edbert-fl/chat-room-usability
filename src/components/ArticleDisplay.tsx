import React, { useContext, useEffect, useState } from "react";
import { Article, ArticleComment } from "../utils/Types";
import { CommentService } from "../services/CommentService.tsx";
import { UserContext } from "../context/UserContextProvider.tsx";
import RandomEmoji from "./RandomEmoji.tsx";

interface ArticleDisplayProps {
  article: Article;
}

export const ArticleDisplay: React.FC<ArticleDisplayProps> = ({ article }) => {
  const [comments, setComments] = useState<ArticleComment[]>([]);
  const [commentDraft, setCommentDraft] = useState("");

  const currUser = useContext(UserContext);

  useEffect(() => {
    getComments(article.id);
  }, []);

  const getComments = async (articleId: number) => {
    try {
      const fetchedComments = await CommentService.getCommentsForArticle(
        articleId
      );
      setComments(fetchedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const addNewComment = async (commentContent: string) => {
    const newComment = {
      id: 3,
      articleId: article.id,
      content: commentContent,
      author: currUser!,
      datePosted: new Date(),
    };

    try {
      await CommentService.addComment(newComment); // Call addComment method
      console.log("New comment added successfully!");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  return (
    <div className="flex-1 pt-6 pl-6 pr-6 mt-2 flex flex-col">
      <div className="flex-1 p-12 mt-2 flex rounded-tl-3xl rounded-tr-3xl drop-shadow-xl bg-white flex-col">
        {/* Article title */}
        <h2 className="text-lg font-semibold mb-4">
          <span className="text-[28px]">{article.title}</span>{" "}
        </h2>

        {/* Article author */}
        <h4 className="text-md font-light mb-4">
          Written by {article.author.username}
        </h4>

        {/* Article content */}
        <p>{article.content}</p>

        <div className="mt-20">
          <h3 className="text-lg font-semibold mb-2">Comments</h3>
          {/* Render existing comments */}
          <ul>
            {comments.map((comment, index) => (
              <li key={index} className="mb-5">
                <h4 className="text-md text-violet-700 font-bold">
                  <RandomEmoji id={comment.author.id} />{" "}
                  {comment.author.username} {" "} 
                  <span className={`text-gray-500 text-xs font-medium`}>
                    {new Date(comment.datePosted).toLocaleString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </h4>
                {comment.content}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Comments section */}
    </div>
  );
};
