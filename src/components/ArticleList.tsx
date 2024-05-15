import React, { useContext, useEffect, useState } from "react";
import { Article } from "../utils/Types.tsx";
import { ROLE, ROLE_COLORS } from "../utils/UserAccessLevels.tsx";
import colors from "tailwindcss/colors";
import { IoArrowBack } from "react-icons/io5";
import { MdPostAdd } from "react-icons/md";
import { TokenContext, UserContext } from "../context/UserContextProvider.tsx";

interface ArticleListProps {
  selectedArticle: Article | null;
  handleArticleSelect: (article: Article) => void;
  toggleCreateArticleScreen: () => void;
  toggleArticlesMenu: () => void;
  triggerNotification: (success: boolean, message: string) => void;
}

export const ArticleList: React.FC<ArticleListProps> = ({
  selectedArticle,
  handleArticleSelect,
  toggleArticlesMenu,
  toggleCreateArticleScreen,
  triggerNotification
}) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [articleListLoading, setArticleListLoading] = useState(false);

  const token = useContext(TokenContext);
  const currUser = useContext(UserContext);

  const getArticles = async () => {
    fetch(`${process.env.REACT_APP_HEROKU_URL}/articles`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        UserID: `${currUser!.id}`,
        Email: `${currUser!.email}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched articles:", data.articles);
        setArticles(data.articles);
      })
      .catch((error) => {
        console.error("Error fetching articles:", error.message);
      });
  };

  useEffect(() => {
    async function fetchArticles() {
      try {
        setArticleListLoading(true);
        getArticles();
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
      <div className="pt-5 w-full px-2 flex justify-between">
        <div className="flex items-center flex-row">
          <button
            className="bg-transparent hover:bg-transparent w-10 h-10 pt-3 items-center justify-center"
            onClick={toggleArticlesMenu}
          >
            <IoArrowBack color={colors.black} size={24} />
          </button>
          <h1 className="text-xl font-semibold ml-3">Articles</h1>
        </div>
        {!currUser!.muted ? (
          <button
            className="bg-transparent hover:bg-transparent w-10 h-10 pt-3 px-10 items-center justify-center"
            onClick={toggleCreateArticleScreen}
          >
            <MdPostAdd size={24} color={colors.black} />
          </button>
        ) : (
          <button
            className="bg-transparent hover:bg-transparent w-10 h-10 pt-3 px-10 items-center justify-center"
            onClick={() => triggerNotification(false, "You have been muted, cannot write new articles.")}
          >
            <MdPostAdd size={24} color={colors.gray[300]} />
          </button>
        )}
      </div>

      {articleListLoading ? (
        <div className="h-[40%] mt-2">
          {/* TODO: Placeholder for loading state */}
        </div>
      ) : (
        <ul className="h-[40%] mt-2">
          {articles.map((article) => (
            <li
              key={article.article_id}
              className={`cursor-pointer pt-1 pb-2 px-4 mx-2 my-1 rounded-md ${
                selectedArticle &&
                selectedArticle.article_id === article.article_id
                  ? "bg-teal-100"
                  : "hover:bg-slate-100"
              }`}
              onClick={() => handleArticleSelect(article)}
            >
              <div className="flex-col">
                <div>
                  <span className="text-lg">
                    {article.endorsed ? "🏅" : null}
                  </span>{" "}
                  {article.title}
                </div>
                {article.anonymous ? (
                  <div
                    style={{
                      color: `${
                        selectedArticle &&
                        selectedArticle.article_id === article.article_id
                          ? colors.teal[700]
                          : colors.teal[500]
                      }`,
                    }}
                    className="font-bold text-xs"
                  >
                    Anonymous · {ROLE[article.author.role]}
                  </div>
                ) : (
                  <div
                    style={{
                      color: `${
                        selectedArticle &&
                        selectedArticle.article_id === article.article_id
                          ? colors.teal[700]
                          : ROLE_COLORS[article.author.role]
                      }`,
                    }}
                    className="font-bold text-xs"
                  >
                    {article.author.username} · {ROLE[article.author.role]}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};
