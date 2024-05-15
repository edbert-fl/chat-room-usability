import React, { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { ArticleComment } from "../utils/Types";
import { ACCESS_LEVEL, ROLE_COLORS, ROLE } from "../utils/UserAccessLevels.tsx";
import { RandomEmoji } from "./RandomEmoji.tsx";
import { TokenContext, UserContext } from "../context/UserContextProvider.tsx";
import { FaTrash, FaVolumeDown, FaVolumeMute } from "react-icons/fa";
import WS_CODE from "../utils/WebscoketCodes.tsx";
import { WebSocketContext } from "../context/WebSocketContextProvider.tsx";

interface CommentBoxProps {
  articleId: number;
  comments: ArticleComment[]
  setComments: Dispatch<SetStateAction<ArticleComment[]>>;
}

export const CommentBox: React.FC<CommentBoxProps> = ({
  articleId,
  comments, 
  setComments
}) => {
  const currUser = useContext(UserContext);
  const token = useContext(TokenContext);
  const ws = useContext(WebSocketContext);

  const [commentDraft, setCommentDraft] = useState<string>("");

  const toggleMute = (userId) => {
    fetch(`${process.env.REACT_APP_HEROKU_URL}/user/toggle/mute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        UserID: `${currUser!.id}`,
        Email: `${currUser!.email}`,
      },
      body: JSON.stringify({ userId }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (data.user.muted) {
          ws?.send(JSON.stringify({
            type: WS_CODE.MUTED,
            receiverId: userId
          }))
        } else {
          ws?.send(JSON.stringify({
            type: WS_CODE.UNMUTED,
            receiverId: userId
          }))
        }
        getCommentsForArticle();
      })
      .catch((error) => {
        console.error("Error muting user:", error.message);
      });
  };

  const getCommentsForArticle = () => {
    fetch(
      `${process.env.REACT_APP_HEROKU_URL}/comments?article_id=${articleId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          UserID: `${currUser!.id}`,
          Email: `${currUser!.email}`,
        },
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data.comments);
        setComments(data.comments);
      })
      .catch((error) => {
        console.error("Error fetching comments:", error.message);
      });
  };

  useEffect(() => {
    getCommentsForArticle();
  }, [articleId]);

  const addComment = (commentContent) => {
    fetch(`${process.env.REACT_APP_HEROKU_URL}/comments/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        UserID: `${currUser!.id}`,
        Email: `${currUser!.email}`,
      },
      body: JSON.stringify({
        article_id: articleId,
        author_id: currUser!.id,
        content: commentContent,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("New comment created:", data);
        setComments((prevComments) => [...prevComments, data.comment]);

        ws?.send(JSON.stringify({
          type: WS_CODE.COMMENT_TRANSFER,
          data: data.comment
        }))
      })
      .catch((error) => {
        console.error("Error creating comment:", error.message);
      });
  };

  const deleteComment = (commentId) => {
    fetch(`${process.env.REACT_APP_HEROKU_URL}/comment/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        UserID: `${currUser!.id}`,
        Email: `${currUser!.email}`,
      },
      body: JSON.stringify({ commentId }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Comment deleted successfully:", data);
        getCommentsForArticle();
      })
      .catch((error) => {
        console.error("Error deleting comment:", error.message);
      });
  };

  return (
    <div className="mt-20">
      <h3 className="text-lg font-semibold mb-2">Comments</h3>
      {/* Render existing comments */}
      {currUser!.muted ? (
        <input
          type="text"
          placeholder="🔇 You have been muted. Not possible to add comments at this time."
          className="w-full border border-gray-300 rounded-md px-3 py-1 mr-2 focus:outline focus:outline-transparent"
          disabled
          value={""}
        />
      ) : (
        <input
          type="text"
          placeholder="💬 Add Comment"
          className="w-full border border-gray-300 rounded-md px-3 py-1 mr-2 focus:outline focus:outline-teal-300"
          value={commentDraft}
          onChange={(e) => setCommentDraft(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              addComment(commentDraft);
              setCommentDraft("");
            }
          }}
        />
      )}

      <ul className="mt-10">
        {comments.map((comment, index) => (
          <li key={index} className="mb-5">
            <div className="flex flex-row">
              <h4
                style={{ color: ROLE_COLORS[comment.author.role] }}
                className="text-md font-bold"
              >
                <RandomEmoji id={comment.author_id} /> {comment.author.username}{" "}
                · {ROLE[comment.author.role]}{" "}
                <span className={`text-gray-500 text-xs font-medium`}>
                  {new Date(comment.written_at).toLocaleString("en-US", {
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </h4>
              {currUser!.role >= ACCESS_LEVEL.ACADEMIC ? (
                <div className="flex flex-row">
                  <button
                    className="w-5 p-0 ml-2 pt-[0.32rem] bg-transparent flex align-top hover:bg-transparent text-2xl"
                    onClick={() => deleteComment(comment.comment_id)}
                  >
                    <FaTrash
                      size={14}
                      className="text-gray-700 hover:text-teal-600"
                    />
                  </button>
                  {comment.author.muted ? (
                    <button
                      className="w-5 p-0 ml-1 pt-[0.3rem] bg-transparent flex align-top hover:bg-transparent text-2xl"
                      onClick={() => toggleMute(comment.author_id)}
                    >
                      <FaVolumeMute
                        size={16}
                        className="text-rose-600 hover:text-rose-500"
                      />
                    </button>
                  ) : (
                    <button
                      className="w-5 p-0 ml-1 pt-[0.3rem] bg-transparent flex align-top hover:bg-transparent text-2xl"
                      onClick={() => toggleMute(comment.author_id)}
                    >
                      <FaVolumeDown
                        size={16}
                        className="text-gray-700 hover:text-teal-600"
                      />
                    </button>
                  )}
                </div>
              ) : null}
            </div>
            {comment.content}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommentBox;
