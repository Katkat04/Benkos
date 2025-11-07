"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

// 🔸 Tipo para las recetas
interface Recipe {
  id: string;
  title: string;
  autor: string;
  portions: string;
  dificultad: string;
  region: string;
  category: string;
  tiempo_preparacion: string;
  ingredients: string;
  steps: string;
  image_url: string;
}

export default function EditRecipe() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [steps, setSteps] = useState<string[]>([""]);
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    fetchRecipe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRecipe = async () => {
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", id)
      .single<Recipe>();

    if (error) {
      console.error(error);
      alert("❌ Error al cargar la receta");
      router.push("/");
    } else if (data) {
      setRecipe(data);
      setPreviewUrl(data.image_url);

      const ingredientsArray = data.ingredients
        ? data.ingredients.split("\n").filter((i) => i.trim() !== "")
        : [""];
      const stepsArray = data.steps
        ? data.steps.split("\n").filter((s) => s.trim() !== "")
        : [""];

      setIngredients(ingredientsArray.length > 0 ? ingredientsArray : [""]);
      setSteps(stepsArray.length > 0 ? stepsArray : [""]);
      setLoading(false);
    }
  };

  const handleAddIngredient = () => setIngredients([...ingredients, ""]);
  const handleAddStep = () => setSteps([...steps, ""]);

  const handleRemoveIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const handleChangeIngredient = (index: number, value: string) => {
    const updated = [...ingredients];
    updated[index] = value;
    setIngredients(updated);
  };

  const handleChangeStep = (index: number, value: string) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!recipe) return;

    if (!recipe.title || !recipe.autor) {
      alert("⚠️ Por favor completa los campos obligatorios");
      return;
    }

    const validIngredients = ingredients.filter((i) => i.trim() !== "");
    const validSteps = steps.filter((s) => s.trim() !== "");

    if (validIngredients.length === 0) {
      alert("⚠️ Debes tener al menos un ingrediente");
      return;
    }

    if (validSteps.length === 0) {
      alert("⚠️ Debes tener al menos un paso");
      return;
    }

    let imageUrl = recipe.image_url;

    if (newPhoto) {
      const fileName = `images/${Date.now()}_${newPhoto.name}`;
      const { error: uploadError } = await supabase.storage
        .from("recipes")
        .upload(fileName, newPhoto);

      if (uploadError) {
        console.error("Error al subir imagen:", uploadError.message);
        alert("❌ Error al subir la imagen");
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("recipes")
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;
    }

    const ingredientsString = validIngredients.join("\n");
    const stepsString = validSteps.join("\n");

    const { error } = await supabase
      .from("recipes")
      .update({
        title: recipe.title,
        autor: recipe.autor,
        portions: recipe.portions,
        dificultad: recipe.dificultad,
        region: recipe.region,
        category: recipe.category,
        tiempo_preparacion: recipe.tiempo_preparacion,
        ingredients: ingredientsString,
        steps: stepsString,
        image_url: imageUrl,
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert("❌ Error al actualizar la receta");
    } else {
      alert("✅ Receta actualizada con éxito");
      router.push("/");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando receta...</p>
        </div>
      </div>
    );
  }

  if (!recipe) return null;

  return (
    <form
      onSubmit={handleUpdate}
      className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-lg mt-10 mb-10 space-y-6"
    >
      <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">
        Editar receta ✏️
      </h2>

      {/* Título */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Nombre de la receta *
        </label>
        <input
          type="text"
          value={recipe.title || ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setRecipe({ ...recipe, title: e.target.value })
          }
          required
          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          placeholder="Título de la receta"
        />
      </div>

      {/* Imagen */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Imagen de la receta
        </label>

        {previewUrl && (
          <div className="mb-3">
            <img
              src={previewUrl}
              alt="Vista previa"
              className="w-full h-64 object-cover rounded-xl shadow-md"
            />
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
              setNewPhoto(file);
              setPreviewUrl(URL.createObjectURL(file));
            }
          }}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
        />
      </div>

      {/* Grid de campos básicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Autor */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Autor *
          </label>
          <input
            type="text"
            value={recipe.autor || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setRecipe({ ...recipe, autor: e.target.value })
            }
            required
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            placeholder="Nombre del autor"
          />
        </div>

        {/* Tiempo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tiempo de preparación
          </label>
          <input
            type="time"
            value={recipe.tiempo_preparacion || ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setRecipe({ ...recipe, tiempo_preparacion: e.target.value })
            }
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Formato: Horas:Minutos (ej: 00:30 para 30 minutos)
          </p>
        </div>

        {/* Porciones */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Porciones
          </label>
          <select
            value={recipe.portions || ""}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setRecipe({ ...recipe, portions: e.target.value })
            }
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          >
            <option value="">Selecciona</option>
            {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? "porción" : "porciones"}
              </option>
            ))}
          </select>
        </div>

        {/* Dificultad */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Dificultad
          </label>
          <select
            value={recipe.dificultad || ""}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setRecipe({ ...recipe, dificultad: e.target.value })
            }
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          >
            <option value="">Selecciona</option>
            <option value="facil">🟢 Fácil</option>
            <option value="media">🟡 Media</option>
            <option value="dificil">🔴 Difícil</option>
          </select>
        </div>

        {/* Región */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Región
          </label>
          <select
            value={recipe.region || ""}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setRecipe({ ...recipe, region: e.target.value })
            }
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          >
            <option value="">Selecciona</option>
            {[
              "Andina",
              "Amazonía",
              "Caribe",
              "Insular",
              "Orinoquía",
              "Pacífico",
            ].map((dep) => (
              <option key={dep} value={dep}>
                {dep}
              </option>
            ))}
          </select>
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Categoría
          </label>
          <select
            value={recipe.category || ""}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setRecipe({ ...recipe, category: e.target.value })
            }
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          >
            <option value="">Selecciona</option>
            <option value="Desayuno">🌅 Desayuno</option>
            <option value="Almuerzo">☀️ Almuerzo</option>
            <option value="Cena">🌙 Cena</option>
            <option value="Postre">🍰 Postre</option>
            <option value="Bebida">🥤 Bebida</option>
            <option value="Entrada">🥗 Entrada</option>
            <option value="Plato fuerte">🍽️ Plato fuerte</option>
          </select>
        </div>
      </div>

      {/* Ingredientes */}
      <div className="bg-orange-50 p-4 rounded-lg">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Ingredientes * 🥘
        </label>
        <div className="space-y-2">
          {ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2">
              <span className="flex items-center justify-center w-8 h-10 bg-orange-200 text-orange-700 font-semibold rounded">
                {i + 1}
              </span>
              <input
                type="text"
                value={ing}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleChangeIngredient(i, e.target.value)
                }
                placeholder={`Ingrediente ${i + 1}`}
                className="flex-1 rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
              {ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(i)}
                  className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={handleAddIngredient}
          className="mt-3 text-orange-600 font-semibold hover:text-orange-700 hover:underline"
        >
          + Agregar otro ingrediente
        </button>
      </div>

      {/* Pasos */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Pasos de preparación * 👨‍🍳
        </label>
        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-2">
              <span className="flex items-center justify-center w-8 h-auto bg-blue-200 text-blue-700 font-semibold rounded px-2 py-2">
                {i + 1}
              </span>
              <textarea
                rows={2}
                value={step}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleChangeStep(i, e.target.value)
                }
                placeholder={`Describe el paso ${i + 1}`}
                className="flex-1 rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
              />
              {steps.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveStep(i)}
                  className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition h-fit"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={handleAddStep}
          className="mt-3 text-blue-600 font-semibold hover:text-blue-700 hover:underline"
        >
          + Agregar otro paso
        </button>
      </div>

      {/* Botones */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-400 transition"
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md"
        >
          💾 Guardar cambios
        </button>
      </div>
    </form>
  );
}