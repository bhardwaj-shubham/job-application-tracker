import { Link } from "react-router";
import FormField from "../components/forms/FormField";
import React, { useState } from "react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log(email, password);
  };

  return (
    <main>
      <h1>Login</h1>

      <form onSubmit={handleSubmit}>
        <FormField
          id="email"
          name="email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
        />

        <FormField
          id="password"
          name="password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
        />

        <button type="submit">Login</button>
      </form>

      <p>
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </main>
  );
};

export default LoginPage;
