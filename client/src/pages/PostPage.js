import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate
import { formatISO9075 } from "date-fns";
import { UserContext } from "../UserContext";
import "../App.css";

export default function PostPage() {
  const [postInfo, setPostInfo] = useState(null);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate(); // Initialize useNavigate
  const { userInfo } = useContext(UserContext); // Get user info from context

  // Fetch the post info from the backend
  useEffect(() => {
    fetch(`http://localhost:4000/post/${id}`).then((response) => {
      response.json().then((postInfo) => {
        setPostInfo(postInfo);
        setLikes(postInfo.likes || 0); // Initialize likes from the backend (optional)
      });
    });
  }, [id]);

  // Handle like/unlike functionality
  const handleLike = () => {
    if (!liked) {
      setLikes(likes + 1);
      setLiked(true);
    } else {
      setLikes(likes - 1);
      setLiked(false);
    }
  };

  // Redirect to EditPost page
  const handleEdit = () => {
    navigate(`/edit/${id}`); // Redirect to the EditPost page with the post ID
  };

  // If postInfo is not loaded yet, return loading state
  if (!postInfo) return <div>Loading...</div>;

  return (
    <div className="post-page">
      <h1>{postInfo.title}</h1>
      <time>{formatISO9075(new Date(postInfo.createdAt))}</time>
      <div className="author">by @{postInfo.author.username}</div>
      <div className="image">
        <img src={`http://localhost:4000/${postInfo.cover}`} alt="" />
      </div>

      {/* Like Section */}
      <div className="like-section">
        <button
          className={`like-button ${liked ? "liked" : ""}`}
          onClick={handleLike}
        >
          ❤️
        </button>
        <span className="like-count">
          {likes} {likes === 1 ? "Like" : "Likes"}
        </span>
      </div>

      <div
        className="content"
        dangerouslySetInnerHTML={{ __html: postInfo.content }}
      />

      {/* Edit Button */}
      {userInfo?.id === postInfo.author._id && ( // Show only if the logged-in user is the author
        <button className="edit-button" onClick={handleEdit}>
          Edit Post
        </button>
      )}
    </div>
  );
}
