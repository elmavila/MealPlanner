import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import RecipeImage from "./RecipeImage";
import { Recipe } from "./recipeTypes";

interface RecipeDetailProps {
  recipe: Recipe;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}

function RecipeDetail({ recipe, onEdit, onDelete }: RecipeDetailProps) {
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) return;
    await onDelete();
  };

  return (
    <main className="min-h-screen bg-[#f8f5df] px-4 py-8 text-[#263126] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/recipes")}
            className="border-[#b9c69b] bg-[#e1e8c9] text-[#66784a] hover:bg-[#d4dfb9] hover:text-[#52643b]"
          >
            <ArrowLeft className="h-4 w-4" />
            All recipes
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/foodschedule")}
            className="border-[#b9c69b] text-[#66784a] hover:bg-[#e1e8c9] hover:text-[#52643b]"
          >
            Food Schedule
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onEdit}
            className="border-[#b9c69b] text-[#66784a] hover:bg-[#e1e8c9] hover:text-[#52643b]"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleDelete}
            className="border-[#d9aaaa] text-[#a65d5d] hover:bg-[#f8eeee] hover:text-[#8f4e4e]"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
        <article className="overflow-hidden rounded-2xl border-2 border-[#cbd7ad] bg-[#fbf8e9] shadow-[0_12px_30px_rgba(95,110,66,0.08)]">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <RecipeImage
              src={recipe.image}
              alt={recipe.title}
              className="aspect-[4/3] h-full w-full object-cover object-center lg:aspect-auto"
              loading="eager"
            />
            <div className="flex flex-col justify-center p-6 sm:p-10">
              {recipe.category && (
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8b9b68]">
                  {recipe.category}
                </span>
              )}
              <h1 className="mt-3 text-3xl font-bold text-[#202820] sm:text-4xl">
                {recipe.title}
              </h1>
              {recipe.description && (
                <p className="mt-5 text-base leading-7 text-[#697364]">
                  {recipe.description}
                </p>
              )}
              <div className="mt-6 inline-flex w-fit rounded-full bg-[#e1e8c9] px-4 py-2 text-sm font-semibold text-[#66784a]">
                {recipe.servings} portioner
              </div>
            </div>
          </div>
          <div className="grid gap-8 border-t border-[#dce3c6] p-6 sm:p-10 lg:grid-cols-[0.8fr_1.2fr]">
            <section>
              <h2 className="text-2xl font-semibold text-[#313b2e]">
                Ingredienser
              </h2>
              <ul className="mt-4 space-y-3 text-[#697364]">
                {recipe.ingredients.map((ingredient) => (
                  <li key={ingredient} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#aebc8e]" />
                    {ingredient}
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-semibold text-[#313b2e]">
                Gör så här
              </h2>
              <ol className="mt-4 space-y-4 text-[#697364]">
                {recipe.instructions.map((instruction, index) => (
                  <li key={instruction} className="flex gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#71834e] text-sm font-semibold text-white">
                      {index + 1}
                    </span>
                    <span className="pt-1 leading-6">{instruction}</span>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </article>
      </div>
    </main>
  );
}

export default RecipeDetail;
