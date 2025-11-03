"use client";
import { useEffect, useState } from "react";
import { supabase } from "../app/lib/supabaseClient";
import Link from "next/link";

type Recipe = {
  id: string;
  title: string;
  autor: string;
  tiempo_preparacion: string | null;
  portions: string | null;
  departament: string | null;
  category: string | null;
  ingredients: string;
  steps: string;
  dificultad: string | null;
  image_url?: string | null;
  created_at: string;
};

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setRecipes(data || []);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Seguro que quieres eliminar esta receta?")) {
      const { error } = await supabase.from("recipes").delete().eq("id", id);
      if (error) console.error(error);
      else fetchRecipes();
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Recetas 🍲</h1>

      <div className="text-center mb-6">
        <Link
          href="/create"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          ➕ Agregar nueva receta
        </Link>
      </div>

      {recipes.length === 0 ? (
        <p className="text-center text-gray-600">No hay recetas aún.</p>
      ) : (
        <ul className="space-y-6">
          {recipes.map((recipe) => (
            <li
              key={recipe.id}
              className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition"
            >
              {recipe.image_url && (
                <img
                  src={recipe.image_url}
                  alt={recipe.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}

              <h2 className="text-2xl font-semibold mb-1">{recipe.title}</h2>
              <p className="text-gray-700 mb-1">
                <strong>Autor:</strong> {recipe.autor}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Tiempo de preparación:</strong>{" "}
                {recipe.tiempo_preparacion || "N/A"}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Porciones:</strong> {recipe.portions || "N/A"}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Categoría:</strong> {recipe.category || "N/A"}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Departamento:</strong> {recipe.departament || "N/A"}
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Dificultad:</strong> {recipe.dificultad || "N/A"}
              </p>

              <div className="mb-2">
                <strong>Ingredientes:</strong>
                <ul className="list-disc list-inside text-gray-700">
                  {recipe.ingredients
                    ?.split("\n")
                    .filter((i) => i.trim() !== "")
                    .map((ing, idx) => (
                      <li key={idx}>{ing}</li>
                    ))}
                </ul>
              </div>

              <div className="mb-4">
                <strong>Pasos:</strong>
                <ol className="list-decimal list-inside text-gray-700">
                  {recipe.steps
                    ?.split("\n")
                    .filter((p) => p.trim() !== "")
                    .map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                </ol>
              </div>

              {/* 👇 Botones */}
              <div className="flex gap-3">
                <Link
                  href={`/edit/${recipe.id}`}
                  className="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600 transition"
                >
                  Editar
                </Link>

                <button
                  onClick={() => handleDelete(recipe.id)}
                  className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 transition"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}