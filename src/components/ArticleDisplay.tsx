import React, { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { Article, ArticleComment } from "../utils/Types";
import { ACCESS_LEVEL, ROLE, ROLE_COLORS } from "../utils/UserAccessLevels.tsx";
import { CommentBox } from "./CommentBox.tsx";
import remarkGfm from "remark-gfm";
import Markdown from "react-markdown";
import { FaEdit } from "react-icons/fa";
import colors from "tailwindcss/colors";
import { UserContext } from "../context/UserContextProvider.tsx";

interface ArticleDisplayProps {
  selectedArticle: Article;
  toggleEditArticleScreen: () => void;
  comments: ArticleComment[]
  setComments: Dispatch<SetStateAction<ArticleComment[]>>;
}

export const ArticleDisplay: React.FC<ArticleDisplayProps> = ({
  selectedArticle,
  toggleEditArticleScreen,
  comments,
  setComments
}) => {
  const currUser = useContext(UserContext);

  return (
    <div className="flex-1 pt-6 pl-6 pr-6 flex flex-col overflow-y-auto max-h-[100vh]">
      <div className="flex-1 p-12 my-2 flex rounded-3xl drop-shadow-xl bg-white flex-col px-[12%]">
        {selectedArticle.sponsored_by ? (
          <h4 className="text-md text-gray-500">
            This article was Sponsored by {selectedArticle.sponsored_by}
          </h4>
        ) : null}
        {/* Article title */}
        <div className="flex flex-row justify-between items-center">
          <div className="text-lg font-semibold justify-center">
            <span className="text-[28px]">{selectedArticle.title}</span>{" "}
          </div>
          {currUser!.id === selectedArticle.author.id ||
          currUser!.role >= ACCESS_LEVEL.ACADEMIC ? (
            <button
              className="bg-transparent hover:bg-transparent w-10 h-10 pt-3 items-center justify-center"
              onClick={toggleEditArticleScreen}
            >
              <FaEdit className="mt-1" color={colors.gray[700]} size={24} />
            </button>
          ) : null}
        </div>

        {/* Article author */}
        <h4 className="text-lg text-gray-500">
          Written by{" "}
          <span
            style={{ color: ROLE_COLORS[selectedArticle.author.role] }}
            className="font-bold"
          >
            {selectedArticle.author.username} · {ROLE[selectedArticle.author.role]}
          </span>
        </h4>

        {/* Article content */}
        <div className="w-full mt-5">
          <Markdown
            remarkPlugins={[remarkGfm]}
            className="prose-base prose-headings:font-bold prose-neutral"
          >
            {selectedArticle.content}
          </Markdown>
        </div>

        <CommentBox articleId={selectedArticle.article_id} comments={comments} setComments={setComments}/>
      </div>
    </div>
  );
};
