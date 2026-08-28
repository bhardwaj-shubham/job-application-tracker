import { useState } from "react";
import { Link, useNavigate } from "react-router";

import { signupSchema } from "../schemas/auth.ts";
import { getFormErrors } from "../utils/formErrors.ts";

import FormField from "../components/forms/FormField.tsx";
import { ApiError } from "../services/api/authClient.ts";
import useAuth from "@/hooks/useAuth.ts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";

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
  const [serverError, setServerError] = useState("");

  const { signup } = useAuth();

  const navigate = useNavigate();

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
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

    try {
      setServerError("");

      await signup(result.data);

      navigate("/login", {
        state: {
          message: "Account created successfully. Please log in.",
        },
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
        return;
      }

      setServerError("Something went wrong. Please try again.");
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

    if (serverError) {
      setServerError("");
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
    <main className="w-full max-w-md">
      <h1 className="text-center text-2xl">Sign up</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-center">Create a new account</CardTitle>
          <CardTitle>
            {serverError && (
              <p className="text-red-500 text-center text-sm">{serverError}</p>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormField
              id="name"
              name="name"
              label="Name"
              value={name}
              placeholder="John Doe"
              onChange={handleNameChange}
              error={errors.name}
              className="w-full min-w-xs "
            />

            <FormField
              id="email"
              name="email"
              label="Email"
              type="email"
              value={email}
              placeholder="m@example.com"
              onChange={handleEmailChange}
              error={errors.email}
              className="w-full min-w-xs"
            />

            <FormField
              id="password"
              name="password"
              label="Password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              error={errors.password}
              className="w-full min-w-xs"
            />

            <CardFooter className="flex-col gap-2">
              <Button type="submit" className="w-full hover:cursor-pointer">
                Signup
              </Button>

              <p>
                You have an account?{" "}
                <Link to="/login" className="hover:underline">
                  Login
                </Link>
              </p>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default SignupPage;
