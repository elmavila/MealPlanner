import React, { useEffect, useRef, useState } from "react";
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
import {
  ChefHat,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Eraser,
} from "lucide-react";
import ShoppingList from "../components/ShoppingList";
import { ApiUrl } from "@/helpers/apiHelpers";

// Måltids struktur
interface Meal {
  id: number;
  dayOfWeek: number;
  lunch: string;
  dinner: string;
  userId: number;
  week_start: string;
}

interface RecipeLink {
  id: number;
  title: string;
}

function getMondayDate(date: Date) {
  const monday = new Date(date);
  const day = monday.getDay();
  monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
  const year = monday.getFullYear();
  const month = String(monday.getMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(monday.getDate()).padStart(2, "0");
  return `${year}-${month}-${dayOfMonth}`;
}

function getISOWeekNumber(weekStart: string) {
  const date = new Date(`${weekStart}T00:00:00`);
  const thursday = new Date(date);
  thursday.setDate(date.getDate() + 3);
  const firstThursday = new Date(thursday.getFullYear(), 0, 4);
  const difference = thursday.getTime() - firstThursday.getTime();
  return 1 + Math.round(difference / (7 * 24 * 60 * 60 * 1000));
}

async function updateMeal(meal: Meal, weekStart: string) {
  const userId = localStorage.getItem("userId");
  const response = await fetch(ApiUrl + "/foodschedule", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...meal, userId, weekStart }),
  });
  if (response.ok) window.dispatchEvent(new Event("shopping-list-updated"));
}

function FoodSchedule() {
  // Skapar en tillståndsvariabel 'meals' som initialt är en tom array
  const [meals, setMeals] = useState<Meal[]>([]);
  const [recipeLinks, setRecipeLinks] = useState<RecipeLink[]>([]);
  const [editingMealField, setEditingMealField] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [weekStart, setWeekStart] = useState(() => getMondayDate(new Date()));
  const currentWeekStart = getMondayDate(new Date());
  const previousWeekStart = getMondayDate(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  );
  const recipeLinkClickTimeout = useRef<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const userId = localStorage.getItem("userId");
    setUserEmail(email);

    // Kontrollera om användar-ID finns i localStorage innan du hämtar måltider
    if (userId) {
      fetch(ApiUrl + `/foodschedule/${userId}?weekStart=${weekStart}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data: Meal[]) =>
          setMeals(
            data.map((meal) => ({
              ...meal,
              lunch: meal.lunch ?? "",
              dinner: meal.dinner ?? "",
            })),
          ),
        )
        // Uppdaterar tillståndet 'meals' med den hämtade datan

        .catch((error) => console.error("Error fetching meals:", error));
      fetch(ApiUrl + `/recipes/${userId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data: RecipeLink[]) => setRecipeLinks(data))
        .catch((error) => console.error("Error fetching recipes:", error));
      // Hanterar eventuella fel som uppstår under hämtningen
    } else {
      console.error("User ID not found in localStorage");
    }
  }, [weekStart]);

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
    const updatedMeal = { ...meal, lunch: newText, userId };
    setMeals((currentMeals) =>
      currentMeals.map((currentMeal) =>
        currentMeal.id === id ? updatedMeal : currentMeal,
      ),
    );
    updateMeal(updatedMeal, weekStart);
    console.log(`${id}, ${newText}`);
  };

  const handleDinner = (id: number, newText: string) => {
    const userId = parseInt(localStorage.getItem("userId") ?? "0");
    const meal = meals.find((m) => m.id == id)!;
    const updatedMeal = { ...meal, dinner: newText, userId };
    setMeals((currentMeals) =>
      currentMeals.map((currentMeal) =>
        currentMeal.id === id ? updatedMeal : currentMeal,
      ),
    );
    updateMeal(updatedMeal, weekStart);
    console.log(`${id}, ${newText}`);
  };

  const normalizeRecipeText = (text: string | null | undefined) =>
    (text ?? "").trim().replace(/\s+/g, " ").toLocaleLowerCase("sv-SE");

  const findRecipeLink = (mealText: string) =>
    recipeLinks.find(
      (recipe) =>
        normalizeRecipeText(recipe.title) === normalizeRecipeText(mealText),
    );

  const renderMealField = (
    meal: Meal,
    mealType: "lunch" | "dinner",
    placeholder: string,
    className: string,
  ) => {
    const mealText = mealType === "lunch" ? meal.lunch : meal.dinner;
    const recipeLink = findRecipeLink(mealText);
    const fieldKey = `${meal.id}-${mealType}`;
    const handleChange = (newText: string) =>
      mealType === "lunch"
        ? handleLunch(meal.id, newText)
        : handleDinner(meal.id, newText);

    if (recipeLink && editingMealField !== fieldKey) {
      return (
        <button
          type="button"
          onClick={() => {
            if (recipeLinkClickTimeout.current !== null) {
              window.clearTimeout(recipeLinkClickTimeout.current);
              recipeLinkClickTimeout.current = null;
              return;
            }
            recipeLinkClickTimeout.current = window.setTimeout(() => {
              navigate(`/recipes/${recipeLink.id}`);
              recipeLinkClickTimeout.current = null;
            }, 250);
          }}
          onDoubleClick={() => {
            if (recipeLinkClickTimeout.current !== null) {
              window.clearTimeout(recipeLinkClickTimeout.current);
              recipeLinkClickTimeout.current = null;
            }
            setEditingMealField(fieldKey);
          }}
          className={`${className} flex h-auto w-full cursor-pointer !items-start !justify-start rounded-md border px-3 py-2 text-left font-normal leading-normal text-foreground shadow-xs outline-none`}
          aria-label={`Edit meal or open recipe ${recipeLink.title}`}
        >
          {mealText}
        </button>
      );
    }

    return (
      <Textarea
        value={mealText}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={(e) => {
          handleChange(e.target.value);
          setEditingMealField(null);
        }}
        onKeyDown={(e) => handleKeyDown(e, meal.id, mealType)}
        placeholder={placeholder}
        className={className}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = "auto";
          target.style.height = `${target.scrollHeight}px`;
        }}
      />
    );
  };

  const handleClearAll = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear all lunch and dinner fields?",
    );
    if (!confirmed) return;

    const userId = parseInt(localStorage.getItem("userId") ?? "0");
    const clearedMeals = meals.map((meal) => ({
      ...meal,
      lunch: "",
      dinner: "",
      userId,
    }));

    setMeals(clearedMeals);
    clearedMeals.forEach((meal) => updateMeal(meal, weekStart));
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
    id: number,
    mealType: "lunch" | "dinner",
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
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#8b9b68]">
              <ChefHat className="h-4 w-4" />
              Mealplanner
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#FEFAE0]">
              Food Schedule
            </h1>
          </div>
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
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => navigate("/recipes")}
              variant="outline"
              className="border-[#6f8a4f] bg-[#FEFAE0] text-[#6f8a4f] hover:bg-lime-50"
            >
              Recipes
            </Button>
            <Button
              onClick={handleClearAll}
              variant="outline"
              className="border-[#d9aaaa] bg-[#FEFAE0] text-[#a65d5d] hover:bg-[#f8eeee]"
            >
              <Eraser className="h-4 w-4" />
              Clear all fields
            </Button>
            <div className="ml-0 flex w-fit items-center gap-0 rounded-md border border-[#6f8a4f] bg-[#FEFAE0] px-0.5 py-1 sm:ml-auto">
              {weekStart === currentWeekStart && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setWeekStart(previousWeekStart)}
                  aria-label="Show previous week"
                  className="h-7 w-7 text-[#6f8a4f] hover:bg-[#e8eed8]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              <span className="min-w-[4.5rem] text-center text-sm font-semibold text-[#6f8a4f]">
                Vecka {getISOWeekNumber(weekStart)}
              </span>
              {weekStart === previousWeekStart && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setWeekStart(currentWeekStart)}
                  aria-label="Show current week"
                  className="h-7 w-7 text-[#6f8a4f] hover:bg-[#e8eed8]"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </nav>

        {/* Meal Schedule Table - Desktop Version */}
        <Card className="mb-8 hidden md:block bg-[#FEFAE0] border-[#6f8a4f]">
          <CardHeader>
            <CardTitle className="text-2xl text-[#6f8a4f] font-semibold">
              Vecka {getISOWeekNumber(weekStart)}
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
                      {renderMealField(
                        meal,
                        "lunch",
                        "Lunch",
                        "min-h-[60px] resize-none border-[#6f8a4f] bg-white/70",
                      )}
                    </TableCell>
                  ))}
                </TableRow>
                {/* Dinner Row */}
                <TableRow>
                  {meals.map((meal) => (
                    <TableCell key={`dinner-${meal.id}`} className="p-2">
                      {renderMealField(
                        meal,
                        "dinner",
                        "Dinner",
                        "min-h-[60px] resize-none border-[#6f8a4f] bg-white/70",
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Meal Schedule Cards - Mobile Version */}
        <div className="mb-8 md:hidden space-y-4">
          <ShoppingList weekStart={weekStart} />
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
                    {renderMealField(
                      meal,
                      "lunch",
                      "What's for lunch?",
                      "min-h-[80px] resize-none border-[#6f8a4f] focus:border-lime-400 focus:ring-lime-400 bg-white/70",
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      Dinner
                    </label>
                    {renderMealField(
                      meal,
                      "dinner",
                      "What's for dinner?",
                      "min-h-[80px] resize-none border-[#6f8a4f] focus:border-lime-400 focus:ring-lime-400 bg-white/70",
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Shopping List - desktop only here (mobile version above) */}
        <div className="hidden md:block">
          <ShoppingList weekStart={weekStart} />
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
