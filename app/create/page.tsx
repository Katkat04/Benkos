"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export default function AddRecipe() {
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null); // 👈 vista previa
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file)); // 👈 genera la URL temporal
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !ingredients || !steps || !difficulty) {
      alert("⚠️ Por favor completa todos los campos antes de guardar.");
      return;
    }

    setLoading(true);
    let imageUrl = null;

    // 👇 Subir imagen al bucket "recipes"
    if (photo) {
      const fileName = `images/${Date.now()}_${photo.name}`;

      const { data, error: uploadError } = await supabase.storage
        .from("recipes")
        .upload(fileName, photo, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Error al subir imagen:", uploadError.message);
        alert("❌ Error al subir la imagen");
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("recipes")
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;
    }

    // 👇 Insertar receta
    const { error } = await supabase.from("recipes").insert([
      {
        title,
        ingredients,
        steps,
        difficulty,
        image_url: imageUrl,
      },
    ]);

    if (error) {
      console.error("Error al agregar receta:", error.message);
      alert("❌ No se pudo agregar la receta");
      setLoading(false);
    } else {
      alert("✅ Receta añadida con éxito");
      router.push("/"); // 👈 Redirigir al homepage
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto bg-white p-6 rounded-2xl shadow-md mt-10"
    >
      <h2 className="text-2xl font-bold mb-4 text-center">Agregar receta 🍴</h2>

      <input
        type="text"
        placeholder="Título"
        className="w-full border p-2 mb-3 rounded"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        placeholder="Ingredientes"
        className="w-full border p-2 mb-3 rounded"
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
      />

      <textarea
        placeholder="Pasos"
        className="w-full border p-2 mb-3 rounded"
        value={steps}
        onChange={(e) => setSteps(e.target.value)}
      />

      <input
        type="text"
        placeholder="Dificultad"
        className="w-full border p-2 mb-3 rounded"
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
      />

      {/* 👇 Subir imagen */}
      <input
        type="file"
        accept="image/*"
        className="w-full border p-2 mb-3 rounded"
        onChange={handlePhotoChange}
      />

      {/* 👇 Vista previa */}
      {preview && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
          <img
            src={preview}
            alt="Vista previa"
            className="w-full h-48 object-cover rounded-lg shadow"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 rounded text-white transition ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "Guardando..." : "Guardar Receta"}
      </button>
    </form>
  );
}