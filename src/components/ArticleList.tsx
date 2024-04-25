import React, { useEffect, useState } from "react";
import { Article } from "../utils/Types.tsx";
import { ArticleService } from "../services/ArticleService.tsx";

interface ArticleListProps {
  selectedArticle: Article | null;
  handleArticleSelect: (article: Article) => void;
}

export const ArticleList: React.FC<ArticleListProps> = ({
  selectedArticle,
  handleArticleSelect,
}) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [articleListLoading, setArticleListLoading] = useState(false);

  useEffect(() => {
    async function fetchArticles() {
      try {
        setArticleListLoading(true);
        const articles = await ArticleService.getArticles();
        setArticles(articles);
        setArticleListLoading(false);
      } catch (error) {
        console.error("Error fetching articles:", error);
        setArticleListLoading(false);
      }
    }

    fetchArticles();
  }, []);

  return (
    <>
      <div className="pt-5 p-4 mx-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold inline-block">Articles</h2>
        {/* TODO: Add button or link for creating new articles */}
      </div>

      {articleListLoading ? (
        <div className="h-[40%]">
          {/* TODO: Placeholder for loading state */}
        </div>
      ) : (
        <ul className="h-[40%]">
          {articles.map((article) => (
            <li
              key={article.id}
              className={`cursor-pointer py-2 px-4 mx-2 my-1 rounded-md ${
                selectedArticle && selectedArticle.id === article.id
                  ? "bg-teal-300"
                  : ""
              }`}
              onClick={() => handleArticleSelect(article)}
            >
              {article.title}
            </li>
          ))}
        </ul>
      )}
    </>
  );
};
