import { useState } from "react";
import { Link } from "react-router";

import { signupSchema } from "../schemas/auth.ts";
import { getFormErrors } from "../utils/formErrors.ts";

import FormField from "../components/forms/FormField.tsx";

type SignupErrors = {
  name?: string;
  email?: string;
  password?: string;
};

const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<SignupErrors>({});

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = signupSchema.safeParse({
      name,
      email,
      password,
    });

    if (!result.success) {
      setErrors(getFormErrors(result.error));
      return;
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);

    if (errors.name) {
      setErrors((previous) => ({
        ...previous,
        name: undefined,
      }));
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
      <h1>Sign up</h1>

      <form onSubmit={handleSubmit}>
        <FormField
          id="name"
          name="name"
          label="Name"
          value={name}
          onChange={handleNameChange}
          error={errors.name}
        />

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

        <button type="submit">Signup</button>
      </form>

      <p>
        You have an account? <Link to="/login">Login</Link>
      </p>
    </main>
  );
};

export default SignupPage;
