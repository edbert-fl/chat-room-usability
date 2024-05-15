import React, { useContext, useState } from "react";
import { TokenContext, UserContext } from "../context/UserContextProvider.tsx";
import { Article } from "../utils/Types.tsx";

interface EditArticleProps {
  handleArticleSelect: (article: Article) => void;
  articleToEdit: Article | null;
  toggleEditArticleScreen: () => void;
  triggerNotification: (success: boolean, message: string) => void;
}

export const EditArticle: React.FC<EditArticleProps> = ({
  handleArticleSelect,
  articleToEdit,
  toggleEditArticleScreen,
  triggerNotification
}) => {
  const [title, setTitle] = useState(articleToEdit?.title);
  const [content, setContent] = useState(articleToEdit?.content);

  const currUser = useContext(UserContext);
  const token = useContext(TokenContext);

  const editArticle = () => {
    fetch(`${process.env.REACT_APP_HEROKU_URL}/article/edit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        UserID: `${currUser!.id}`,
        Email: `${currUser!.email}`,
      },
      body: JSON.stringify({
        article_id: articleToEdit!.article_id,
        title: title,
        content: content,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("New article edited:", data);
        handleArticleSelect(data.article);
        toggleEditArticleScreen();
        triggerNotification(true, "Successfully edited article!");
      })
      .catch((error) => {
        console.error("Error editing article:", error.message);
        triggerNotification(false, "Error editing article");
      });
  };

  return (
    <div className="flex-1 pt-6 pl-6 pr-6 flex flex-col overflow-y-auto max-h-[100vh]">
      <div className="flex-1 py-12 px-48 mt-2 flex rounded-3xl drop-shadow-xl bg-white flex-col">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your article a catchy title"
          className="rounded-md text-4xl font-semibold focus:outline-none"
          style={{ border: "none" }}
          required
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Article Content"
          className="rounded-md mb-20 mt-2 min-h-[60vh] focus:outline-none"
          style={{ border: "none" }}
          required
        ></textarea>
        <div className="flex flex-row">
          <button
            onClick={editArticle}
            className="bg-teal-500 text-white py-2 px-4 w-[150px] rounded-md hover:bg-teal-600 transition duration-300"
          >
            Save Changes
          </button>
          <button
            onClick={toggleEditArticleScreen}
            className="bg-slate-400 text-white ml-2 py-2 px-4 w-[150px] rounded-md hover:bg-slate-500 transition duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
