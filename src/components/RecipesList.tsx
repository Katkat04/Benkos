"use client";
import { useState } from "react";
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

interface RecipesListProps {
  initialRecipes: Recipe[];
}

export default function RecipesList({ initialRecipes }: RecipesListProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  console.log("Selected Region:", selectedRegion);
  console.log("Regions in recipes:", initialRecipes.map(r => r.region));
  //console.log("Filtered recipes:", filteredRecipes.length);

  // Filtrar recetas por región seleccionada
  const filteredRecipes = selectedRegion
    ? initialRecipes.filter((recipe) => recipe.region === selectedRegion)
    : initialRecipes;

  const formatTime = (time: string | null) => {
    if (!time) return 'N/A';
    
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

  return (
    <>
      {/* Mapa interactivo */}
      <MapaColombia 
        onRegionSelect={setSelectedRegion}
        selectedRegion={selectedRegion}
      />

      {/* Título de sección con filtro activo */}
      <div className="mb-6">
        {selectedRegion ? (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Recetas de {selectedRegion}
            </h2>
            <p className="text-gray-600">
              Mostrando {filteredRecipes.length} {filteredRecipes.length === 1 ? 'receta' : 'recetas'}
            </p>
            <button
              onClick={() => setSelectedRegion(null)}
              className="mt-3 text-orange-500 hover:text-orange-600 font-medium"
            >
              ← Ver todas las recetas
            </button>
          </div>
        ) : (
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">
            Todas las Recetas
          </h2>
        )}
      </div>

      {/* Lista de recetas */}
      {filteredRecipes.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🍽️</div>
          {selectedRegion ? (
            <>
              <p className="text-gray-600 text-xl mb-4">
                No hay recetas de {selectedRegion} aún
              </p>
              <p className="text-gray-500">¡Sé el primero en compartir una receta de esta región!</p>
            </>
          ) : (
            <>
              <p className="text-gray-600 text-xl mb-4">No hay recetas aún</p>
              <p className="text-gray-500">¡Sé el primero en compartir una receta!</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <Link
              href={`/pages/recipe/${recipe.id}`}
              //key={recipe.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Imagen */}
              <div className="block">
                {recipe.image_url ? (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={recipe.image_url}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
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
              </div>

              {/* Contenido */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="block mb-3">
                  <h2 className="text-2xl font-bold text-gray-800 mb-1 line-clamp-2">
                    {recipe.title}
                  </h2>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <span>👨‍🍳</span>
                    <span className="font-medium">{recipe.autor}</span>
                  </p>
                </div>

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

                {/* Vista previa de ingredientes */}
                <div className="mb-3 flex-1">
                  <h3 className="font-semibold text-gray-700 mb-2 text-sm">Ingredientes:</h3>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {recipe.ingredients
                      ?.split("\n")
                      .filter((i) => i.trim() !== "")
                      .slice(0, 3)
                      .join(", ")}
                    {recipe.ingredients?.split("\n").filter((i) => i.trim() !== "").length > 3 && (
                      <span className="text-xs text-gray-500">, +{recipe.ingredients.split("\n").filter((i) => i.trim() !== "").length - 3} más...</span>
                    )}
                  </p>
                </div>


                {/* Botón ver más */}
                <div className="flex gap-2 mt-auto pt-3 border-t border-gray-100">
                  <Link
                    href={`/pages/recipe/${recipe.id}`}
                    className="flex-1 bg-orange-500 text-white text-center px-4 py-2 rounded-lg hover:bg-orange-600 transition font-medium text-sm"
                  >
                    Ver receta completa
                  </Link>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}