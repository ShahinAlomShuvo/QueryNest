/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { signIn } from "next-auth/react";
import Link from "next/link";

import { Bot } from "@/components/icons";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");

        return;
      }

      router.push(callbackUrl);
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } catch (error) {
      setError("An error occurred with Google sign in");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[#8e24aa] flex items-center justify-center">
              <Bot className="w-10 h-10 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Or{" "}
            <Link className="text-[#8e24aa] hover:underline" href="/register">
              create a new account
            </Link>
          </p>
        </div>

        <Button
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 dark:border-gray-600 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 py-2.5"
          isLoading={isLoading}
          onPress={handleGoogleSignIn}
        >
          <svg
            height="24"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 5c1.617 0 3.082.603 4.197 1.597l2.944-2.944A9.97 9.97 0 0 0 12 1a9.977 9.977 0 0 0-8.99 5.737L6.483 9.12A5.995 5.995 0 0 1 12 5Z"
              fill="#4285F4"
            />
            <path
              d="M23 12c0-.669-.055-1.32-.163-1.943H12v3.709h6.179A5.272 5.272 0 0 1 16.4 16.61l3.455 2.688C21.755 17.261 23 14.828 23 12Z"
              fill="#34A853"
            />
            <path
              d="M5.257 14.217A6.01 6.01 0 0 1 5 12c0-.777.167-1.514.483-2.177L3.01 6.737A9.935 9.935 0 0 0 2 12c0 1.673.411 3.252 1.14 4.646l2.117-3.03Z"
              fill="#FBBC05"
            />
            <path
              d="M12 23c2.608 0 4.935-.861 6.704-2.303l-3.454-2.688a5.971 5.971 0 0 1-3.25.941 5.99 5.99 0 0 1-5.517-4.131l-3.13 2.424A9.975 9.975 0 0 0 12 23Z"
              fill="#EA4335"
            />
          </svg>
          <span>Sign in with Google</span>
        </Button>

        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-sm font-medium text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="email">
                Email address
              </label>
              <Input
                required
                autoComplete="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                size="lg"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="password"
              >
                Password
              </label>
              <Input
                required
                autoComplete="current-password"
                id="password"
                name="password"
                placeholder="Enter your password"
                size="lg"
                type="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <Button
              className="w-full"
              color="secondary"
              isLoading={isLoading}
              size="lg"
              type="submit"
            >
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
