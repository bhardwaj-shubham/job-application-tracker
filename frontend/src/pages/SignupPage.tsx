import { Link } from "react-router";
import FormField from "../components/forms/FormField";
import { useState } from "react";

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log(name, email, password);
  };

  return (
    <main>
      <h1>Sign up</h1>

      <form onSubmit={handleSubmit}>
        <FormField
          id="name"
          name="name"
          label="Name"
          value={name}
          onChange={setName}
        />

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

        <button type="submit">Signup</button>
      </form>

      <p>
        You have an account? <Link to="/login">Login</Link>
      </p>
    </main>
  );
};

export default SignupPage;
