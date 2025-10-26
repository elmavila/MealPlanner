import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronUp } from "lucide-react";
import ShoppingList from "../components/ShoppingList";

// Måltids struktur
interface Meal {
  id: number;
  dayOfWeek: number;
  lunch: string;
  dinner: string;
  userId: number;
}

function updateMeal(meal: Meal) {
  const userId = localStorage.getItem("userId");
  fetch("http://localhost:3032/foodschedule", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...meal, userId }),
  });
}

function FoodSchedule() {
  // Skapar en tillståndsvariabel 'meals' som initialt är en tom array
  const [meals, setMeals] = useState<Meal[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const userId = localStorage.getItem("userId");
    setUserEmail(email);

    // Kontrollera om användar-ID finns i localStorage innan du hämtar måltider
    if (userId) {
      fetch(`http://localhost:3032/foodschedule/${userId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => setMeals(data))
        // Uppdaterar tillståndet 'meals' med den hämtade datan

        .catch((error) => console.error("Error fetching meals:", error));
      // Hanterar eventuella fel som uppstår under hämtningen
    } else {
      console.error("User ID not found in localStorage");
    }
  }, []);

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      setShowScrollToTop(scrollTop > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleLunch = (id: number, newText: string) => {
    const userId = parseInt(localStorage.getItem("userId") ?? "0");
    const meal = meals.find((m) => m.id == id)!;
    meal.lunch = newText;
    updateMeal({ ...meal, userId });
    console.log(`${id}, ${newText}`);
  };

  const handleDinner = (id: number, newText: string) => {
    const userId = parseInt(localStorage.getItem("userId") ?? "0");
    const meal = meals.find((m) => m.id == id)!;
    meal.dinner = newText;
    updateMeal({ ...meal, userId });
    console.log(`${id}, ${newText}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
    id: number,
    mealType: "lunch" | "dinner"
  ) => {
    if (event.key === "Enter") {
      const newText = (event.target as HTMLInputElement).value;
      if (mealType === "lunch") {
        handleLunch(id, newText);
      } else {
        handleDinner(id, newText);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#CCD5AE] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 space-y-4 md:space-y-0">
          <h1 className="text-3xl md:text-4xl font-bold text-[#FEFAE0]">
            Food Schedule
          </h1>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
            <p className="text-gray-600 text-sm md:text-base">
              Logged in as: <span className="font-medium">{userEmail}</span>
            </p>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-gray-300 hover:bg-gray-50 w-fit"
            >
              Log out
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mb-6">
          <Button
            onClick={() => navigate("/recipes")}
            variant="outline"
            className="border-[#6f8a4f] bg-[#FEFAE0] text-[#6f8a4f] hover:bg-lime-50"
          >
            Recipes
          </Button>
        </nav>

        {/* Meal Schedule Table - Desktop Version */}
        <Card className="mb-8 hidden md:block bg-[#FEFAE0] border-[#6f8a4f]">
          <CardHeader>
            <CardTitle className="text-2xl text-[#6f8a4f] font-semibold">
              Weekly Meal Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[14.28%] text-center font-semibold">
                    Mon
                  </TableHead>
                  <TableHead className="w-[14.28%] text-center font-semibold">
                    Tue
                  </TableHead>
                  <TableHead className="w-[14.28%] text-center font-semibold">
                    Wed
                  </TableHead>
                  <TableHead className="w-[14.28%] text-center font-semibold">
                    Thu
                  </TableHead>
                  <TableHead className="w-[14.28%] text-center font-semibold">
                    Fri
                  </TableHead>
                  <TableHead className="w-[14.28%] text-center font-semibold">
                    Sat
                  </TableHead>
                  <TableHead className="w-[14.28%] text-center font-semibold">
                    Sun
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Lunch Row */}
                <TableRow>
                  {meals.map((meal) => (
                    <TableCell key={`lunch-${meal.id}`} className="p-2">
                      <Textarea
                        defaultValue={meal.lunch}
                        onBlur={(e) => handleLunch(meal.id, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, meal.id, "lunch")}
                        placeholder="Lunch"
                        className="min-h-[60px] resize-none border-[#6f8a4f] bg-white/70"
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = "auto";
                          target.style.height = `${target.scrollHeight}px`;
                        }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
                {/* Dinner Row */}
                <TableRow>
                  {meals.map((meal) => (
                    <TableCell key={`dinner-${meal.id}`} className="p-2">
                      <Textarea
                        defaultValue={meal.dinner}
                        onBlur={(e) => handleDinner(meal.id, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, meal.id, "dinner")}
                        placeholder="Dinner"
                        className="min-h-[60px] resize-none border-[#6f8a4f] bg-white/70"
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = "auto";
                          target.style.height = `${target.scrollHeight}px`;
                        }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Meal Schedule Cards - Mobile Version */}
        <div className="mb-8 md:hidden space-y-4">
          <ShoppingList />
          <h2 className="text-2xl font-bold text-[#6f8a4f] mb-4">
            Weekly Meal Plan
          </h2>
          {meals.map((meal) => {
            const dayNames = [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ];
            const dayName =
              dayNames[meal.dayOfWeek - 1] || `Day ${meal.dayOfWeek}`;

            return (
              <Card key={meal.id} className="border-[#6f8a4f] bg-[#FEFAE0]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-[#6f8a4f] flex items-center gap-2">
                    {dayName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      Lunch
                    </label>
                    <Textarea
                      defaultValue={meal.lunch}
                      onBlur={(e) => handleLunch(meal.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, meal.id, "lunch")}
                      placeholder="What's for lunch?"
                      className="min-h-[80px] resize-none border-[#6f8a4f] focus:border-lime-400 focus:ring-lime-400 bg-white/70"
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = "auto";
                        target.style.height = `${target.scrollHeight}px`;
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      Dinner
                    </label>
                    <Textarea
                      defaultValue={meal.dinner}
                      onBlur={(e) => handleDinner(meal.id, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, meal.id, "dinner")}
                      placeholder="What's for dinner?"
                      className="min-h-[80px] resize-none border-[#6f8a4f] focus:border-lime-400 focus:ring-lime-400 bg-white/70"
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = "auto";
                        target.style.height = `${target.scrollHeight}px`;
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Shopping List - desktop only here (mobile version above) */}
        <div className="hidden md:block">
          <ShoppingList />
        </div>

        {/* Scroll to Top Button - Mobile Only */}
        {showScrollToTop && (
          <Button
            onClick={scrollToTop}
            className="md:hidden fixed bottom-6 right-6 h-9 w-9 rounded-full bg-[#6f8a4f] hover:bg-[#6f8a4f]-700 shadow-md z-50 p-0"
            aria-label="Scroll to top"
          >
            <ChevronUp className="h-4 w-4 text-white" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default FoodSchedule;
