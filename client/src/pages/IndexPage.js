import Post from "../Post";
import { useEffect, useState } from "react";
import backgroundImage from "../assets/blog.jpeg";

export default function IndexPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/post").then((response) => {
      response.json().then((posts) => {
        setPosts(posts);
      });
    });
  }, []);

  return (
    <div
      className="index-background"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        paddingTop: "80px",
      }}
    >
      <div className="posts-wrapper">
        {posts.length > 0 &&
          posts.map((post) => <Post key={post._id} {...post} />)}
      </div>
    </div>
  );
}
