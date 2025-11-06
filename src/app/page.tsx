"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import MapaColombia from "@/src/components/map";

type Recipe = {
  id: string;
  title: string;
  autor: string;
  tiempo_preparacion: string | null;
  portions: string | null;
  region: string | null;
  category: string | null;
  ingredients: string;
  steps: string;
  dificultad: string | null;
  image_url?: string | null;
  created_at: string;
};

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setRecipes(data || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Seguro que quieres eliminar esta receta?")) {
      const { error } = await supabase.from("recipes").delete().eq("id", id);
      if (error) console.error(error);
      else fetchRecipes();
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return 'N/A';
    
    // Si el tiempo viene en formato HH:MM:SS o HH:MM
    const parts = time.split(':');
    if (parts.length >= 2) {
      const hours = parseInt(parts[0]);
      const minutes = parseInt(parts[1]);
      
      if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}min`;
      } else if (hours > 0) {
        return `${hours}h`;
      } else if (minutes > 0) {
        return `${minutes}min`;
      }
    }
    
    return time;
  };

  const getDifficultyColor = (dificultad: string | null) => {
    switch (dificultad?.toLowerCase()) {
      case 'facil':
        return 'bg-green-100 text-green-700';
      case 'media':
        return 'bg-yellow-100 text-yellow-700';
      case 'dificil':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getDifficultyEmoji = (dificultad: string | null) => {
    switch (dificultad?.toLowerCase()) {
      case 'facil':
        return '🟢';
      case 'media':
        return '🟡';
      case 'dificil':
        return '🔴';
      default:
        return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando recetas deliciosas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            BENKO'S
          </h1>
          
          <Link
            href="/create"
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-orange-600 hover:shadow-xl transition-all transform hover:scale-105 font-semibold"
          >
            <span className="text-xl">➕</span>
            Agregar nueva receta
          </Link>
        </div>
        <MapaColombia />

        {/* Lista de recetas */}
        {recipes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍽️</div>
            <p className="text-gray-600 text-xl mb-4">No hay recetas aún</p>
            <p className="text-gray-500">¡Sé el primero en compartir una receta!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Imagen - clickeable */}
                <Link href={`/recipe/${recipe.id}`} className="block">
                  {recipe.image_url ? (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={recipe.image_url}
                        alt={recipe.title}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(recipe.dificultad)}`}>
                          {getDifficultyEmoji(recipe.dificultad)} {recipe.dificultad || 'N/A'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-orange-200 to-yellow-200 flex items-center justify-center">
                      <span className="text-6xl">🍽️</span>
                    </div>
                  )}
                </Link>

                {/* Contenido */}
                <div className="p-5 flex-1 flex flex-col">
                  {/* Título y autor - clickeable */}
                  <Link href={`/recipe/${recipe.id}`} className="block mb-3 hover:text-orange-600 transition">
                    <h2 className="text-2xl font-bold text-gray-800 mb-1 line-clamp-2">
                      {recipe.title}
                    </h2>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <span>👨‍🍳</span>
                      <span className="font-medium">{recipe.autor}</span>
                    </p>
                  </Link>

                  {/* Info rápida */}
                  <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                    {recipe.tiempo_preparacion && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <span>⏱️</span>
                        <span>{formatTime(recipe.tiempo_preparacion)}</span>
                      </div>
                    )}
                    {recipe.portions && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <span>🍽️</span>
                        <span>{recipe.portions} {recipe.portions === '1' ? 'porción' : 'porciones'}</span>
                      </div>
                    )}
                    {recipe.category && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <span>🏷️</span>
                        <span>{recipe.category}</span>
                      </div>
                    )}
                    {recipe.region && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <span>📍</span>
                        <span>{recipe.region}</span>
                      </div>
                    )}
                  </div>

                  {/* Ingredientes preview 
                  <div className="mb-3 flex-1">
                    <h3 className="font-semibold text-gray-700 mb-2 text-sm">Ingredientes:</h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {recipe.ingredients
                        ?.split("\n")
                        .filter((i) => i.trim() !== "")
                        .slice(0, 3)
                        .map((ing, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-orange-500 mt-1">•</span>
                            <span className="line-clamp-1">{ing}</span>
                          </li>
                        ))}
                    </ul>
                    {recipe.ingredients?.split("\n").filter((i) => i.trim() !== "").length > 3 && (
                      <p className="text-xs text-gray-500 mt-1">
                        +{recipe.ingredients.split("\n").filter((i) => i.trim() !== "").length - 3} más...
                      </p>
                    )}
                  </div>
                  */}

                  {/* Botones */}
                  <div className="flex gap-2 mt-auto pt-3 border-t border-gray-100">
                    <Link
                      href={`/recipe/${recipe.id}`}
                      className="flex-1 bg-orange-500 text-white text-center px-4 py-2 rounded-lg hover:bg-orange-600 transition font-medium text-sm"
                    >
                      Ver más
                    </Link>
{/* Botones 
                    <Link
                      href={`/edit/${recipe.id}`}
                      className="flex-1 bg-blue-500 text-white text-center px-4 py-2 rounded-lg hover:bg-blue-600 transition font-medium text-sm"
                    >
                      ✏️ Editar
                    </Link>

                    <button
                      onClick={() => handleDelete(recipe.id)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium text-sm"
                    >
                      🗑️
                    </button>
                    */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}