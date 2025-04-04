import { useState } from "react";
import { Navigate } from "react-router-dom";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [redirectToLogin, setRedirectToLogin] = useState(false);

  async function register(ev) {
    ev.preventDefault();
    if (username.length < 3) {
      alert("Username should be at least 3 characters long");
      return;
    }
    const response = await fetch("http://localhost:4000/register", {
      method: "POST",
      body: JSON.stringify({ email, username, password }),
      headers: { "Content-Type": "application/json" },
    });

    if (response.status === 200) {
      alert("Registration successful");
      setRedirectToLogin(true); // Redirect to login after successful registration
    } else {
      alert("Registration failed, User already exists");
    }
  }

  if (redirectToLogin) {
    return <Navigate to="/login" />;
  }

  return (
    <form className="register" onSubmit={register}>
      <h1>Register</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(ev) => setUsername(ev.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(ev) => setEmail(ev.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(ev) => setPassword(ev.target.value)}
      />
      <button type="submit">Register</button>
    </form>
  );
}
