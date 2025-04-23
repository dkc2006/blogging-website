import { useState, useContext } from "react";
import { Navigate, Link } from "react-router-dom";
import { UserContext } from "../UserContext";

export default function LoginPage() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState(false);
  const { setUserInfo } = useContext(UserContext);

  async function login(ev) {
    ev.preventDefault();
    const response = await fetch("http://localhost:4000/login", {
      method: "POST",
      body: JSON.stringify({ userName, password }),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (response.ok) {
      const userInfo = await response.json();
      setUserInfo(userInfo);
      alert("Login successful");
      setRedirect(true);
    } else {
      alert("Wrong credentials");
    }
  }

  if (redirect) {
    return <Navigate to="/" />;
  }

  return (
    <div className="page-background">
      {" "}
      <form className="login" onSubmit={login}>
        <h1>Login</h1>

        <input
          type="text"
          placeholder="UserName"
          value={userName}
          onChange={(ev) => setUserName(ev.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
        />

        <button>Log in</button>
        <div className="login-options">
          <Link
            to="/forgot-password"
            className="forgot-password"
            style={{ fontSize: "16px" }}
          >
            Forgot password?
          </Link>
          <Link
            to="/register"
            className="create-account"
            style={{ fontSize: "17px", padding: "12px" }}
          >
            Create new account
          </Link>
        </div>
      </form>
    </div>
  );
}
