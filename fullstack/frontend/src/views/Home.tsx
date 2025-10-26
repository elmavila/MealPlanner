import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Login from "../components/Login";
import Register from "../components/Register";
import Logo from "@/assets/Yummie.svg";

function Home() {
  const navigate = useNavigate();

  const [selectedAction, setSelectedAction] = useState<
    "login" | "register" | ""
  >("");

  function handleLoginClick() {
    setSelectedAction("login");
    navigate("/login");
  }

  function handleRegisterClick() {
    setSelectedAction("register");
    navigate("/register");
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#CCD5AE]">
      <img
        src={Logo}
        alt="Mealplaner logo"
        className="absolute top-20 w-70 h-auto opacity-95"
      />

      <Card className="w-full max-w-md bg-[#FEFAE0] border border-[#E0E5B6] shadow-lg rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold mb-4 text-[#CCD5AE]">
            Mealplaner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleLoginClick}
              variant="default"
              className="w-full bg-[#CCD5AE] text-[#4d4d4d] hover:opacity-75 hover:bg-[#CCD5AE]"
            >
              Log In
            </Button>
            <Button
              onClick={handleRegisterClick}
              variant="outline"
              className="w-full border-[#6f8a4f] text-[#6f8a4f] bg-transparent hover:opacity-90 hover:bg-transparent hover:text-[#6f8a4f]"
            >
              Register
            </Button>
          </div>

          {selectedAction === "login" && <Login />}
          {selectedAction === "register" && <Register />}
        </CardContent>
      </Card>
    </div>
  );
}

export default Home;
