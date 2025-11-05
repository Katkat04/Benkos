'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

export default function CreateRecipe() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [autor, setAutor] = useState('');
  const [tiempo, setTiempo] = useState('');
  const [porciones, setPorciones] = useState('');
  const [dificultad, setDificultad] = useState('');
  const [region, setRegion] = useState('');
  const [categoria, setCategoria] = useState('');
  const [ingredients, setIngredients] = useState(['']);
  const [steps, setSteps] = useState(['']);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleAddIngredient = () => setIngredients([...ingredients, '']);
  const handleAddStep = () => setSteps([...steps, '']);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  }
};


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !title ||
      !autor ||
      !tiempo ||
      !porciones ||
      !dificultad ||
      !region ||
      !categoria
    ) {
      alert("⚠️ Por favor completa todos los campos obligatorios.");
      return;
    }

    // Filtrar ingredientes y pasos vacíos
    const validIngredients = ingredients.filter(i => i.trim() !== '');
    const validSteps = steps.filter(s => s.trim() !== '');

    if (validIngredients.length === 0) {
      alert("⚠️ Debes agregar al menos un ingrediente.");
      return;
    }

    if (validSteps.length === 0) {
      alert("⚠️ Debes agregar al menos un paso.");
      return;
    }

    let imageUrl = null;

    // Subir imagen si existe
    if (photo) {
      const fileName = `images/${Date.now()}_${photo.name}`;
      const { error: uploadError } = await supabase.storage
        .from("recipes")
        .upload(fileName, photo);

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

    // Convertir arrays a strings con saltos de línea (texto simple)
    const ingredientsString = validIngredients.join('\n');
    const stepsString = validSteps.join('\n');

    // Insertar receta
    const { error } = await supabase.from("recipes").insert([
      {
        title,
        autor,
        tiempo_preparacion: tiempo,
        portions: porciones,
        dificultad,
        category: categoria,
        region: region,
        ingredients: ingredientsString,
        steps: stepsString,
        image_url: imageUrl,
      },
    ]);

    if (error) {
      console.error("Error al agregar receta:", error.message);
      alert("❌ No se pudo agregar la receta");
    } else {
      alert("✅ Receta añadida con éxito");
      router.push("/");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-2xl mt-6">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Crear nueva receta 🍳
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nombre de la receta *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Ej: Arepa e' huevo"
            className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
        </div>

        {/* Imagen con vista previa */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Imagen de la receta
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
          />
          {preview && (
            <div className="mt-4">
              <img
                src={preview}
                alt="Vista previa"
                className="w-full h-64 object-cover rounded-xl shadow-md"
              />
            </div>
          )}
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
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              required
              placeholder="Tu nombre"
              className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>

          {/* Tiempo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tiempo de preparación *
            </label>
            <input
              type="time"
              value={tiempo}
              onChange={(e) => setTiempo(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Formato: Horas:Minutos (ej: 00:30 para 30 minutos)
            </p>
          </div>

          {/* Porciones */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Porciones *
            </label>
            <select
              value={porciones}
              onChange={(e) => setPorciones(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            >
              <option value="">Selecciona</option>
              {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'porción' : 'porciones'}
                </option>
              ))}
            </select>
          </div>

          {/* Dificultad */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Dificultad *
            </label>
            <select
              value={dificultad}
              onChange={(e) => setDificultad(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
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
              Región *
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            >
              <option value="">Selecciona</option>
              {['Caribe', 'Insular', 'Andina', 'Pacífico', 'Orinoquía', 'Amazonas', ].map(
                (dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 p-3 focus:ring-2 focus:ring-orange-400 focus:border-transparent"
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
                  onChange={(e) => handleChangeIngredient(i, e.target.value)}
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
                  onChange={(e) => handleChangeStep(i, e.target.value)}
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
            className="flex-1 bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition shadow-md"
          >
            ✨ Crear receta
          </button>
        </div>
      </form>
    </div>
  );
}