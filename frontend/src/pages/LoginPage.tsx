import React, { useState } from "react";
import { Link, useLocation } from "react-router";

import { loginSchema } from "../schemas/auth";
import { getFormErrors } from "../utils/formErrors";

import { ApiError } from "../services/api/apiClient";
import FormField from "../components/forms/FormField";
import useAuth from "../hooks/useAuth";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type LoginErrors = {
  email?: string;
  password?: string;
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<LoginErrors>({});
  const [serverError, setServerError] = useState("");

  const { login } = useAuth();

  const location = useLocation();
  const message = location.state?.message;

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
      setServerError("");

      await login(result.data);
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
    <main className="w-full max-w-md">
      <h1 className="text-center text-2xl">Login</h1>

      {message && <p>{message}</p>}

      <Card>
        <CardHeader>
          <CardTitle className="text-center">Login to your account</CardTitle>
          <CardTitle className="text-red-500 text-sm text-center">
            {serverError && <p>{serverError}</p>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="w-full min-w-xs flex flex-col gap-4"
          >
            <div className="flex flex-col gap-6">
              <FormField
                id="email"
                name="email"
                label="Email"
                type="email"
                value={email}
                placeholder="m@example.com"
                onChange={handleEmailChange}
                error={errors.email}
                className="grid gap-2"
              />

              <FormField
                id="password"
                name="password"
                label="Password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                error={errors.password}
                className=""
              />
            </div>

            <CardFooter className="flex-col gap-2">
              <Button type="submit" className="w-full hover:cursor-pointer">
                Login
              </Button>

              <p>
                Don't have an account?{" "}
                <Link to="/signup" className="hover:underline">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default LoginPage;
