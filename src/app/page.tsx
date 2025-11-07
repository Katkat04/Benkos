import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import RecipesList from "@/src/components/RecipesList";

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

async function getRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }
  
  return data || [];
}

export default async function Home() {
  const recipes = await getRecipes();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            BENKO'S
          </h1>
          <p className="text-gray-600 mb-4">Sabores de Colombia en cada región</p>
          
          <Link
            href="/pages/create"
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-orange-600 hover:shadow-xl transition-all transform hover:scale-105 font-semibold"
          >
            <span className="text-xl">➕</span>
            Agregar nueva receta
          </Link>
        </div>

        {/* Componente del lado del cliente con mapa y recetas */}
        <RecipesList initialRecipes={recipes} />
      </div>
    </div>
  );
}