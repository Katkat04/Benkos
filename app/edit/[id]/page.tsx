"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function EditRecipe() {
  const [recipe, setRecipe] = useState(null);
  const [newPhoto, setNewPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    fetchRecipe();
  }, []);

  const fetchRecipe = async () => {
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) console.error(error);
    else {
      setRecipe(data);
      setPreviewUrl(data.image_url);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    let imageUrl = recipe.image_url;

    // 👇 Si el usuario sube una nueva imagen
    if (newPhoto) {
      const fileName = `images/${Date.now()}_${newPhoto.name}`;

      const { error: uploadError } = await supabase.storage
        .from("recipes")
        .upload(fileName, newPhoto, {
          cacheControl: "3600",
          upsert: false,
        });

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

    // 👇 Actualizar todos los datos
    const { error } = await supabase
      .from("recipes")
      .update({
        title: recipe.title,
        autor: recipe.autor,
        portions: recipe.portions,
        dificultad: recipe.dificultad,
        departament: recipe.departament,
        category: recipe.category,
        tiempo_preparacion: recipe.tiempo_preparacion,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
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

  if (!recipe) return <p className="text-center mt-10">Cargando receta...</p>;

  return (
    <form
      onSubmit={handleUpdate}
      className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-md mt-10 space-y-4"
    >
      <h2 className="text-2xl font-bold mb-4 text-center">Editar receta ✏️</h2>

      {/* Título */}
      <input
        type="text"
        value={recipe.title || ""}
        onChange={(e) => setRecipe({ ...recipe, title: e.target.value })}
        className="w-full border p-2 rounded"
        placeholder="Título"
      />

      {/* Autor */}
      <input
        type="text"
        value={recipe.autor || ""}
        onChange={(e) => setRecipe({ ...recipe, autor: e.target.value })}
        className="w-full border p-2 rounded"
        placeholder="Autor"
      />

      {/* Porciones */}
      <input
        type="number"
        value={recipe.portions || ""}
        onChange={(e) => setRecipe({ ...recipe, portions: e.target.value })}
        className="w-full border p-2 rounded"
        placeholder="Porciones"
      />

      {/* Dificultad */}
      <select
        value={recipe.dificultad || ""}
        onChange={(e) => setRecipe({ ...recipe, dificultad: e.target.value })}
        className="w-full border p-2 rounded"
      >
        <option value="">Selecciona dificultad</option>
        <option value="facil">Fácil</option>
        <option value="media">Media</option>
        <option value="dificil">Difícil</option>
      </select>

      {/* Departamento */}
      <select
        value={recipe.departament || ""}
        onChange={(e) => setRecipe({ ...recipe, departament: e.target.value })}
        className="w-full border p-2 rounded"
      >
        <option value="">Selecciona departamento</option>
        {["Atlántico", "Bolívar", "Córdoba", "Magdalena", "La Guajira", "Sucre", "Cesar"].map(
          (dep) => (
            <option key={dep} value={dep}>
              {dep}
            </option>
          )
        )}
      </select>

      {/* Categoría */}
      <input
        type="text"
        value={recipe.category || ""}
        onChange={(e) => setRecipe({ ...recipe, category: e.target.value })}
        className="w-full border p-2 rounded"
        placeholder="Categoría"
      />

      {/* Tiempo de preparación */}
      <input
        type="time"
        value={recipe.tiempo_preparacion || ""}
        onChange={(e) => setRecipe({ ...recipe, tiempo_preparacion: e.target.value })}
        className="w-full border p-2 rounded"
      />

      {/* Ingredientes */}
      <textarea
        value={recipe.ingredients || ""}
        onChange={(e) => setRecipe({ ...recipe, ingredients: e.target.value })}
        className="w-full border p-2 rounded"
        placeholder="Ingredientes (separados por coma o salto de línea)"
      />

      {/* Pasos */}
      <textarea
        value={recipe.steps || ""}
        onChange={(e) => setRecipe({ ...recipe, steps: e.target.value })}
        className="w-full border p-2 rounded"
        placeholder="Pasos"
      />

      {/* Imagen actual */}
      {previewUrl && (
        <div className="text-center">
          <p className="text-gray-600 mb-2">Imagen actual:</p>
          <img
            src={previewUrl}
            alt="Vista previa"
            className="w-full h-48 object-cover rounded-lg mb-3"
          />
        </div>
      )}

      {/* Nueva imagen */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files[0];
          setNewPhoto(file);
          setPreviewUrl(URL.createObjectURL(file));
        }}
        className="w-full border p-2 rounded"
      />

      {/* Botones */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="bg-gray-400 text-white py-2 px-4 rounded hover:bg-gray-500 transition"
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Guardar cambios
        </button>
      </div>
    </form>
  );
}