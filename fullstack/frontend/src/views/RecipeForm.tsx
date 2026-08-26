import { FormEvent, useState } from "react";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NewRecipeForm, Recipe } from "./recipeTypes";

interface RecipeFormProps {
  onSave: (recipe: NewRecipeForm) => Promise<void>;
  initialRecipe?: Recipe;
}

const initialForm: NewRecipeForm = {
  title: "",
  servings: "4",
  image: "",
  ingredients: "",
  instructions: "",
};

function RecipeForm({ onSave, initialRecipe }: RecipeFormProps) {
  const [form, setForm] = useState<NewRecipeForm>(() =>
    initialRecipe
      ? {
          title: initialRecipe.title,
          servings: String(initialRecipe.servings),
          image: initialRecipe.image,
          ingredients: initialRecipe.ingredients.join("\n"),
          instructions: initialRecipe.instructions.join("\n"),
        }
      : initialForm,
  );

  const updateField = (field: keyof NewRecipeForm, value: string) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const handleImageChange = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateField(
        "image",
        typeof reader.result === "string" ? reader.result : "",
      );
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.ingredients.trim() || !form.instructions.trim()) return;
    await onSave(form);
    setForm(initialForm);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-10 rounded-2xl border-2 border-[#cbd7ad] bg-[#fbf8e9] p-5 shadow-[0_8px_24px_rgba(95,110,66,0.07)] sm:p-8"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[#313b2e]">
          {initialRecipe ? "Edit recipe" : "New recipe"}
        </h2>
        <p className="mt-1 text-sm text-[#7b846f]">
          Add one item per line for ingredients and steps.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <label className="text-sm font-medium text-[#4a5741] lg:col-span-2">
          Recipe name *
          <Input
            required
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            className="mt-2 border-[#b9c69b] bg-[#f8f5df]"
          />
        </label>
        <label className="text-sm font-medium text-[#4a5741]">
          Servings
          <Input
            type="number"
            min="1"
            value={form.servings}
            onChange={(event) => updateField("servings", event.target.value)}
            className="mt-2 border-[#b9c69b] bg-[#f8f5df]"
          />
        </label>
        <label className="text-sm font-medium text-[#4a5741]">
          Recipe image
          <span className="mt-2 flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-[#b9c69b] bg-[#f8f5df] px-3 text-sm font-medium text-[#66784a] hover:bg-[#e1e8c9]">
            <ImagePlus className="h-4 w-4" />
            {form.image ? "Image selected" : "Upload image"}
            <input
              type="file"
              accept="image/*"
              onChange={(event) => handleImageChange(event.target.files?.[0])}
              className="sr-only"
            />
          </span>
          {form.image && (
            <img
              src={form.image}
              alt="Preview"
              className="mt-3 h-24 w-full rounded-md object-cover"
            />
          )}
        </label>
        <div className="grid gap-6 border-t border-[#dce3c6] pt-6 lg:col-span-2 lg:grid-cols-2">
          <label className="text-sm font-medium text-[#4a5741]">
            Ingredients *
            <textarea
              required
              value={form.ingredients}
              onChange={(event) =>
                updateField("ingredients", event.target.value)
              }
              placeholder="400g pasta"
              className="mt-2 min-h-48 w-full resize-y rounded-md border border-[#b9c69b] bg-[#f8f5df] px-3 py-3 text-sm leading-6 outline-none focus:border-[#71834e] focus:ring-2 focus:ring-[#dce3c6]"
            />
          </label>
          <label className="text-sm font-medium text-[#4a5741]">
            How to do *
            <textarea
              required
              value={form.instructions}
              onChange={(event) =>
                updateField("instructions", event.target.value)
              }
              placeholder="Heat the oven ..."
              className="mt-2 min-h-48 w-full resize-y rounded-md border border-[#b9c69b] bg-[#f8f5df] px-3 py-3 text-sm leading-6 outline-none focus:border-[#71834e] focus:ring-2 focus:ring-[#dce3c6]"
            />
          </label>
        </div>
      </div>
      <div className="mt-7 flex justify-end border-t border-[#dce3c6] pt-6">
        <Button
          type="submit"
          className="bg-[#71834e] text-white hover:bg-[#617442]"
        >
          {initialRecipe ? "Save changes" : "Save recipe"}
        </Button>
      </div>
    </form>
  );
}

export default RecipeForm;
