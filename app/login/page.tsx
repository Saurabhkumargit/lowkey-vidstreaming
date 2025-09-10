"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      console.error("Login failed:", result.error);
      alert(result.error);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 border rounded shadow space-y-4">
      <h1 className="text-2xl font-bold text-center">Login</h1>

      {/* Email + Password form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full border px-3 py-2 rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Login
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-2">
        <hr className="flex-1 border-gray-300" />
        <span className="text-gray-500 text-sm">OR</span>
        <hr className="flex-1 border-gray-300" />
      </div>

      {/* Google Login */}
      <button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
      >
        Continue with Google
      </button>

      <div className="text-center text-sm">
        Don’t have an account?{" "}
        <button
          onClick={() => router.push("/register")}
          className="text-blue-500 hover:underline"
        >
          Register
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
