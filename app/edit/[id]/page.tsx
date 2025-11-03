"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function EditRecipe() {
  const [recipe, setRecipe] = useState(null);
  const [newPhoto, setNewPhoto] = useState(null); // 👈 Nueva imagen
  const [previewUrl, setPreviewUrl] = useState(null); // 👈 Vista previa

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
      setPreviewUrl(data.image_url); // mostrar imagen actual
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    let imageUrl = recipe.image_url;

    // 👇 Si el usuario sube una nueva imagen
    if (newPhoto) {
      const fileName = `images/${Date.now()}_${newPhoto.name}`;

      // Subir a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
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

      // Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from("recipes")
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;
    }

    // 👇 Actualizar datos
    const { error } = await supabase
      .from("recipes")
      .update({
        title: recipe.title,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        difficulty: recipe.difficulty,
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
      className="max-w-lg mx-auto bg-white p-6 rounded-2xl shadow-md mt-10"
    >
      <h2 className="text-2xl font-bold mb-4 text-center">Editar receta ✏️</h2>

      <input
        type="text"
        value={recipe.title}
        onChange={(e) => setRecipe({ ...recipe, title: e.target.value })}
        className="w-full border p-2 mb-3 rounded"
        placeholder="Título"
      />

      <textarea
        value={recipe.ingredients}
        onChange={(e) =>
          setRecipe({ ...recipe, ingredients: e.target.value })
        }
        className="w-full border p-2 mb-3 rounded"
        placeholder="Ingredientes"
      />

      <textarea
        value={recipe.steps}
        onChange={(e) => setRecipe({ ...recipe, steps: e.target.value })}
        className="w-full border p-2 mb-3 rounded"
        placeholder="Pasos"
      />

      <input
        type="text"
        value={recipe.difficulty}
        onChange={(e) =>
          setRecipe({ ...recipe, difficulty: e.target.value })
        }
        className="w-full border p-2 mb-3 rounded"
        placeholder="Dificultad"
      />

      {/* 👇 Imagen actual + vista previa */}
      {previewUrl && (
        <div className="mb-3 text-center">
          <p className="text-gray-600 mb-1">Imagen actual:</p>
          <img
            src={previewUrl}
            alt="Vista previa"
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}

      {/* 👇 Campo para subir nueva imagen */}
      <input
        type="file"
        accept="image/*"
        className="w-full border p-2 mb-4 rounded"
        onChange={(e) => {
          const file = e.target.files[0];
          setNewPhoto(file);
          setPreviewUrl(URL.createObjectURL(file));
        }}
      />

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