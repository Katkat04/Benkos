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
    <div
      className="min-h-screen bg-fixed bg-center bg-cover py-8 px-4"
      style={{
        backgroundImage: "url('/fondo.jpeg')",
      }}
    >
      <div className="max-w-7xl mx-auto bg-white/70 p-6 rounded-xl">
        {/* Componente del lado del cliente con mapa y recetas */}
        <RecipesList initialRecipes={recipes} />
      </div>
    </div>
  );
}
