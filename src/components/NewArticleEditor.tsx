import React, { Dispatch, SetStateAction, useContext, useState } from "react";
import { TokenContext, UserContext } from "../context/UserContextProvider.tsx";
import { Article } from "../utils/Types.tsx";

interface NewArticleEditorProps {
  handleArticleSelect: (article: Article) => void;
}

export const NewArticleEditor: React.FC<NewArticleEditorProps> = ({ handleArticleSelect }) => {
  const [title, setTitle] = useState("");
  const [sponsoredBy, setSponsoredBy] = useState("");
  const [content, setContent] = useState("");

  const currUser = useContext(UserContext);
  const token = useContext(TokenContext);

  const createArticle = () => {
    fetch(`${process.env.REACT_APP_HEROKU_URL}/article/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        UserID: `${currUser!.id}`,
        Email: `${currUser!.email}`,
      },
      body: JSON.stringify({
        author_id: currUser!.id,
        title: title,
        content: content,
        sponsored_by: sponsoredBy
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("New article created:", data);
        handleArticleSelect(data.article);
      })
      .catch((error) => {
        console.error("Error creating article:", error.message);
      });
  };

  return (
    <div className="flex-1 pt-6 pl-6 pr-6 flex flex-col overflow-y-auto max-h-[100vh]">
      <div
        className="flex-1 py-12 px-48 mt-2 flex rounded-3xl drop-shadow-xl bg-white flex-col"
      >
        <input
          type="text"
          value={sponsoredBy}
          onChange={(e) => setSponsoredBy(e.target.value)}
          placeholder="Article sponsor (If none, leave blank)"
          className="rounded-md text-xl font-semibold focus:outline-none"
          style={{ border: "none" }}
          required
        />
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
        <button
          onClick={createArticle}
          className="bg-teal-500 text-white py-2 px-4 w-[150px] rounded-md hover:bg-teal-600 transition duration-300"
        >
          Post Article
        </button>
      </div>
    </div>
  );
};
