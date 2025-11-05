"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";

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

export default function RecipeDetail() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      alert("❌ Error al cargar la receta");
      router.push("/");
    } else {
      setRecipe(data);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (confirm("¿Seguro que quieres eliminar esta receta?")) {
      const { error } = await supabase.from("recipes").delete().eq("id", id);
      if (error) {
        console.error(error);
        alert("❌ Error al eliminar");
      } else {
        alert("✅ Receta eliminada");
        router.push("/");
      }
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return 'No especificado';
    
    const parts = time.split(':');
    if (parts.length >= 2) {
      const hours = parseInt(parts[0]);
      const minutes = parseInt(parts[1]);
      
      if (hours > 0 && minutes > 0) {
        return `${hours} ${hours === 1 ? 'hora' : 'horas'} ${minutes} minutos`;
      } else if (hours > 0) {
        return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
      } else if (minutes > 0) {
        return `${minutes} minutos`;
      }
    }
    
    return time;
  };

  const getDifficultyColor = (dificultad: string | null) => {
    switch (dificultad?.toLowerCase()) {
      case 'facil':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'media':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'dificil':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
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
          <p className="text-gray-600 text-lg">Cargando receta...</p>
        </div>
      </div>
    );
  }

  if (!recipe) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Botón volver */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold mb-6 transition"
        >
          <span className="text-xl">←</span>
          Volver a todas las recetas
        </Link>

        {/* Contenedor principal */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Imagen hero */}
          {recipe.image_url ? (
            <div className="relative h-80 md:h-96 overflow-hidden">
              <img
                src={recipe.image_url}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              
              {/* Título sobre la imagen */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                <h1 className="text-4xl md:text-5xl font-bold mb-3 drop-shadow-lg">
                  {recipe.title}
                </h1>
                <div className="flex items-center gap-3 text-lg">
                  <span>👨‍🍳</span>
                  <span className="font-medium">{recipe.autor}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-80 md:h-96 bg-gradient-to-br from-orange-300 to-yellow-300 flex items-center justify-center">
              <div className="text-center">
                <span className="text-8xl">🍽️</span>
                <h1 className="text-4xl md:text-5xl font-bold mt-4 text-white drop-shadow-lg">
                  {recipe.title}
                </h1>
                <div className="flex items-center justify-center gap-3 text-lg mt-3 text-white">
                  <span>👨‍🍳</span>
                  <span className="font-medium">{recipe.autor}</span>
                </div>
              </div>
            </div>
          )}

          {/* Contenido */}
          <div className="p-6 md:p-8">
            {/* Info cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {/* Tiempo */}
              <div className="bg-orange-50 rounded-xl p-4 text-center border border-orange-200">
                <div className="text-3xl mb-2">⏱️</div>
                <div className="text-sm text-gray-600 mb-1">Tiempo</div>
                <div className="font-semibold text-gray-800">
                  {formatTime(recipe.tiempo_preparacion)}
                </div>
              </div>

              {/* Porciones */}
              <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-200">
                <div className="text-3xl mb-2">🍽️</div>
                <div className="text-sm text-gray-600 mb-1">Porciones</div>
                <div className="font-semibold text-gray-800">
                  {recipe.portions || 'N/A'}
                </div>
              </div>

              {/* Dificultad */}
              <div className={`rounded-xl p-4 text-center border ${getDifficultyColor(recipe.dificultad)}`}>
                <div className="text-3xl mb-2">{getDifficultyEmoji(recipe.dificultad)}</div>
                <div className="text-sm mb-1">Dificultad</div>
                <div className="font-semibold capitalize">
                  {recipe.dificultad || 'N/A'}
                </div>
              </div>

              {/* Región */}
              <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-200">
                <div className="text-3xl mb-2">📍</div>
                <div className="text-sm text-gray-600 mb-1">Región</div>
                <div className="font-semibold text-gray-800">
                  {recipe.region || 'N/A'}
                </div>
              </div>
            </div>

            {/* Categoría */}
            {recipe.category && (
              <div className="mb-8 text-center">
                <span className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-full font-semibold">
                  {recipe.category}
                </span>
              </div>
            )}

            {/* Grid de 2 columnas para ingredientes y pasos */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Ingredientes */}
              <div>
                <div className="bg-orange-100 rounded-t-2xl px-6 py-4 border-b-4 border-orange-400">
                  <h2 className="text-2xl font-bold text-orange-800 flex items-center gap-2">
                    <span>🥘</span>
                    Ingredientes
                  </h2>
                </div>
                <div className="bg-orange-50 rounded-b-2xl p-6 border-2 border-orange-200 border-t-0">
                  <ul className="space-y-3">
                    {recipe.ingredients
                      ?.split("\n")
                      .filter((i) => i.trim() !== "")
                      .map((ing, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-700">
                          <span className="flex-shrink-0 w-6 h-6 bg-orange-400 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="flex-1 leading-relaxed">{ing}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>

              {/* Pasos */}
              <div>
                <div className="bg-blue-100 rounded-t-2xl px-6 py-4 border-b-4 border-blue-400">
                  <h2 className="text-2xl font-bold text-blue-800 flex items-center gap-2">
                    <span>👨‍🍳</span>
                    Preparación
                  </h2>
                </div>
                <div className="bg-blue-50 rounded-b-2xl p-6 border-2 border-blue-200 border-t-0">
                  <ol className="space-y-4">
                    {recipe.steps
                      ?.split("\n")
                      .filter((s) => s.trim() !== "")
                      .map((step, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="flex-1 text-gray-700 leading-relaxed pt-1">
                            {step}
                          </span>
                        </li>
                      ))}
                  </ol>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="mt-10 pt-8 border-t border-gray-200 flex flex-wrap gap-4 justify-center">
              <Link
                href={`/edit/${recipe.id}`}
                className="flex items-center gap-2 bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition shadow-md font-semibold"
              >
                <span>✏️</span>
                Editar receta
              </Link>

              <button
                onClick={handleDelete}
                className="flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition shadow-md font-semibold"
              >
                <span>🗑️</span>
                Eliminar receta
              </button>

              <Link
                href="/"
                className="flex items-center gap-2 bg-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-400 transition shadow-md font-semibold"
              >
                <span>←</span>
                Volver al inicio
              </Link>
            </div>

            {/* Fecha de creación */}
            <div className="mt-6 text-center text-sm text-gray-500">
              Publicada el {new Date(recipe.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}