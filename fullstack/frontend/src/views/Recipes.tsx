import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChefHat, Plus, Search, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import RecipeDetail from "./RecipeDetail";
import RecipeForm from "./RecipeForm";
import RecipeImage from "./RecipeImage";
import { NewRecipeForm, Recipe } from "./recipeTypes";
import { ApiUrl } from "@/helpers/apiHelpers";

function Recipes() {
  const navigate = useNavigate();
  const { recipeId } = useParams();
  const [query, setQuery] = useState("");
  const [recipeList, setRecipeList] = useState<Recipe[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const selectedRecipe = recipeList.find(
    (recipe) => String(recipe.id) === recipeId,
  );

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    fetch(`${ApiUrl}/recipes/${userId}`)
      .then((response) => {
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then((data: Recipe[]) => setRecipeList(data))
      .catch((error) => console.error("Fel vid hämtning av recept:", error));
  }, []);

  const filteredRecipes = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();
    if (!searchTerm) return recipeList;
    return recipeList.filter((recipe) =>
      [recipe.title, recipe.description].some((value) =>
        value.toLowerCase().includes(searchTerm),
      ),
    );
  }, [query, recipeList]);

  const handleSaveRecipe = async (form: NewRecipeForm) => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const payload = {
      userId,
      title: form.title.trim(),
      servings: Math.max(1, Number(form.servings) || 1),
      image: form.image || null,
      ingredients: form.ingredients
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      instructions: form.instructions
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    };
    const response = await fetch(
      editingRecipe
        ? `${ApiUrl}/recipes/${editingRecipe.id}`
        : `${ApiUrl}/recipes`,
      {
        method: editingRecipe ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    if (!response.ok) throw new Error(await response.text());
    const savedRecipe: Recipe = await response.json();
    setRecipeList((currentRecipes) =>
      editingRecipe
        ? currentRecipes.map((recipe) =>
            recipe.id === editingRecipe.id ? savedRecipe : recipe,
          )
        : [savedRecipe, ...currentRecipes],
    );
    setEditingRecipe(null);
    setIsFormOpen(false);
  };

  const handleDeleteRecipe = async () => {
    if (!selectedRecipe) return;
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    const response = await fetch(`${ApiUrl}/recipes/${selectedRecipe.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error(await response.text());
    setRecipeList((currentRecipes) =>
      currentRecipes.filter((recipe) => recipe.id !== selectedRecipe.id),
    );
    setEditingRecipe(null);
    setIsFormOpen(false);
    navigate("/recipes");
  };

  if (selectedRecipe) {
    return (
      <RecipeDetail
        recipe={selectedRecipe}
        onEdit={() => {
          setEditingRecipe(selectedRecipe);
          setIsFormOpen(true);
          navigate("/recipes");
        }}
        onDelete={handleDeleteRecipe}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f5df] px-4 py-8 text-[#263126] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-col gap-6 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#8b9b68]">
              <ChefHat className="h-4 w-4" />
              Mealplanner
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-[#71834e] sm:text-5xl">
              Recipes
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/foodschedule")}
              className="w-fit border-[#b9c69b] bg-[#e1e8c9] text-[#66784a] hover:bg-[#d4dfb9] hover:text-[#52643b]"
            >
              <ArrowLeft className="h-4 w-4" />
              Food Schedule
            </Button>
            <Button
              type="button"
              onClick={() => {
                setEditingRecipe(null);
                setIsFormOpen((open) => !open);
              }}
              className="w-fit bg-[#71834e] text-white hover:bg-[#617442]"
            >
              {isFormOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {isFormOpen ? "Close" : "New Recipe"}
            </Button>
          </div>
        </header>

        {isFormOpen && (
          <RecipeForm
            key={editingRecipe?.id ?? "new"}
            initialRecipe={editingRecipe ?? undefined}
            onSave={handleSaveRecipe}
          />
        )}

        <section className="mb-10 flex flex-col gap-5 border-b border-[#dce3c6] pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#313b2e]">My recipes</h2>
            <p className="mt-1 text-sm text-[#7b846f]">
              {filteredRecipes.length}{" "}
              {filteredRecipes.length === 1 ? "recipe" : "recipes"}
            </p>
          </div>
          <label className="relative block w-full sm:max-w-xs">
            <span className="sr-only">Search recipes</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#71834e]" />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search recipes..."
              className="h-11 rounded-full border-[#aebc8e] bg-transparent pl-10 text-[#313b2e] placeholder:text-[#9ba68c] focus-visible:border-[#71834e] focus-visible:ring-[#b9c69b]"
            />
          </label>
        </section>

        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRecipes.map((recipe) => (
              <button
                type="button"
                onClick={() => navigate(`/recipes/${recipe.id}`)}
                key={recipe.id}
                className="w-full overflow-hidden rounded-xl border-2 border-[#cbd7ad] bg-[#fbf8e9] text-left shadow-[0_8px_24px_rgba(95,110,66,0.07)] transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#71834e]"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#e6ebd5]">
                  <RecipeImage
                    src={recipe.image}
                    alt={recipe.title}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <div className="p-5">
                  {recipe.category && (
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8b9b68]">
                      {recipe.category}
                    </span>
                  )}
                  <h3 className="mt-2 text-xl font-semibold text-[#202820]">
                    {recipe.title}
                  </h3>
                  {recipe.description && (
                    <p className="mt-2 text-sm leading-6 text-[#697364]">
                      {recipe.description}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-[#cbd7ad] px-6 py-16 text-center">
            <Search className="mx-auto h-8 w-8 text-[#aebc8e]" />
            <h2 className="mt-4 text-lg font-semibold text-[#4a5741]">
              No recipes found
            </h2>
            <p className="mt-2 text-sm text-[#7b846f]">
              Try another search term.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default Recipes;
