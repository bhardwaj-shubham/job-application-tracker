import React, { useState } from "react";
import { Link } from "react-router";

import { loginSchema } from "../schemas/auth";
import { getFormErrors } from "../utils/formErrors";

import FormField from "../components/forms/FormField";

type LoginErrors = {
  email?: string;
  password?: string;
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<LoginErrors>({});

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = loginSchema.safeParse({
      email,
      password,
    });

    if (!result.success) {
      setErrors(getFormErrors(result.error));
      return;
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);

    if (errors.email) {
      setErrors((previous) => ({
        ...previous,
        email: undefined,
      }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);

    if (errors.password) {
      setErrors((previous) => ({
        ...previous,
        password: undefined,
      }));
    }
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
          onChange={handleEmailChange}
          error={errors.email}
        />

        <FormField
          id="password"
          name="password"
          label="Password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          error={errors.password}
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
