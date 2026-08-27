import React, { useState } from "react";
import { Link } from "react-router";

import { loginSchema } from "../schemas/auth";
import { getFormErrors } from "../utils/formErrors";

import FormField from "../components/forms/FormField";
import { login } from "../services/auth/authService";
import { ApiError } from "../services/api/authClient";

type LoginErrors = {
  email?: string;
  password?: string;
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<LoginErrors>({});
  const [serverError, setServerError] = useState("");

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = loginSchema.safeParse({
      email,
      password,
    });

    if (!result.success) {
      setErrors(getFormErrors(result.error));
      return;
    }

    try {
      const response = await login(result.data);
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
        return;
      }

      setServerError("Something went wrong. Please try again.");
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

    if (serverError) {
      setServerError("");
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

    if (serverError) {
      setServerError("");
    }
  };

  return (
    <main>
      <h1>Login</h1>

      {serverError && <p>{serverError}</p>}

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
