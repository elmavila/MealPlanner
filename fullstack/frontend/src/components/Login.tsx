import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible] = useState(false);
  const navigate = useNavigate();

  const handleSumbit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const fetchResponse = await fetch("http://localhost:3032/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (fetchResponse.ok) {
        const data = await fetchResponse.json();
        console.log("Successfully logged in:", data);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("userEmail", data.email);
        navigate("/foodschedule");
      } else {
        console.error("Login faild");
        alert("Login failed");
      }
    } catch (error) {
      console.error("something went wrong:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#CCD5AE]">
      <Card className="w-full max-w-md mx-auto mt-4 bg-[#FEFAE0] border border-[#E0E5B6]">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-[#CCD5AE]">
            Log In
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSumbit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-[#E0E5B6] bg-[#FAEDCE] focus:border-[#CCD5AE] focus:ring-[#CCD5AE]/50"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Password
              </label>
              <Input
                id="password"
                type={visible ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-[#E0E5B6] bg-[#FAEDCE] focus:border-[#CCD5AE] focus:ring-[#CCD5AE]/50"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#CCD5AE] text-[#4d4d4d] hover:opacity-75 hover:bg-[#CCD5AE]"
            >
              Log In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;
