'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

export default function CreateRecipe() {
  const router = useRouter();

  // Estados para cada campo
  const [title, setTitle] = useState('');
  const [autor, setAutor] = useState('');
  const [tiempo, setTiempo] = useState('');
  const [porciones, setPorciones] = useState('');
  const [dificultad, setDificultad] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [categoria, setCategoria] = useState('');
  const [ingredients, setIngredients] = useState(['']);
  const [steps, setSteps] = useState(['']);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleAddIngredient = () => setIngredients([...ingredients, '']);
  const handleAddStep = () => setSteps([...steps, '']);

  const handleChangeIngredient = (index, value) => {
    const updated = [...ingredients];
    updated[index] = value;
    setIngredients(updated);
  };

  const handleChangeStep = (index, value) => {
    const updated = [...steps];
    updated[index] = value;
    setSteps(updated);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file)); // vista previa
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !title ||
      !ingredients ||
      !steps ||
      !dificultad ||
      !autor ||
      !tiempo ||
      !porciones ||
      !departamento
    ) {
      alert("⚠️ Por favor completa todos los campos antes de guardar.");
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

    // Insertar receta
    const { error } = await supabase.from("recipes").insert([
  {
    title,
    autor,
    tiempo_preparacion: tiempo,
    portions: porciones,       // ✅ coincide con la tabla
    dificultad,                // ✅ existe en la tabla
    category: categoria,       // ✅ coincide con la tabla
    departament: departamento, // ✅ coincide con la tabla
    ingredients,
    steps,
    image_url: imageUrl,       // ✅ coincide
  },
]);


    if (error) {
      console.error("Error al agregar receta:", error.message);
      alert("❌ No se pudo agregar la receta");
    } else {
      alert("✅ Receta añadida con éxito");
      router.push("/"); // Redirige al home
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-2xl mt-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Crear nueva receta 🍳</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Nombre de la receta</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full rounded-xl border border-gray-300 p-2 focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {/* Imagen con vista previa */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Imagen</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full"
          />
          {preview && (
            <img
              src={preview}
              alt="Vista previa"
              className="mt-3 w-full h-48 object-cover rounded-xl"
            />
          )}
        </div>

        {/* Autor */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Autor</label>
          <input
            type="text"
            value={autor}
            onChange={(e) => setAutor(e.target.value)}
            required
            className="mt-1 block w-full rounded-xl border border-gray-300 p-2 focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {/* Tiempo de preparación */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Tiempo de preparación</label>
          <input
            type="time"
            value={tiempo}
            onChange={(e) => setTiempo(e.target.value)}
            required
            className="mt-1 block w-full rounded-xl border border-gray-300 p-2 focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {/* Porciones */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Porciones</label>
          <select
            value={porciones}
            onChange={(e) => setPorciones(e.target.value)}
            className="mt-1 block w-full rounded-xl border border-gray-300 p-2 focus:ring-2 focus:ring-orange-400"
          >
            <option value="">Selecciona</option>
            {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
              <option key={num} value={num}>{num} porciones</option>
            ))}
          </select>
        </div>

        {/* Dificultad */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Dificultad</label>
          <select
            value={dificultad}
            onChange={(e) => setDificultad(e.target.value)}
            className="mt-1 block w-full rounded-xl border border-gray-300 p-2 focus:ring-2 focus:ring-orange-400"
          >
            <option value="">Selecciona</option>
            <option value="facil">Fácil</option>
            <option value="media">Media</option>
            <option value="dificil">Difícil</option>
          </select>
        </div>

        {/* Departamento */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Departamento</label>
          <select
            value={departamento}
            onChange={(e) => setDepartamento(e.target.value)}
            className="mt-1 block w-full rounded-xl border border-gray-300 p-2 focus:ring-2 focus:ring-orange-400"
          >
            <option value="">Selecciona</option>
            {['Atlántico', 'Bolívar', 'Córdoba', 'Magdalena', 'La Guajira', 'Sucre', 'Cesar'].map(
              (dep) => (
                <option key={dep} value={dep}>{dep}</option>
              )
            )}
          </select>
        </div>

        {/* Ingredientes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Ingredientes</label>
          {ingredients.map((ing, i) => (
            <input
              key={i}
              type="text"
              value={ing}
              onChange={(e) => handleChangeIngredient(i, e.target.value)}
              placeholder={`Ingrediente ${i + 1}`}
              className="mt-2 block w-full rounded-xl border border-gray-300 p-2 focus:ring-2 focus:ring-orange-400"
            />
          ))}
          <button
            type="button"
            onClick={handleAddIngredient}
            className="mt-2 text-orange-600 font-semibold hover:underline"
          >
            + Agregar ingrediente
          </button>
        </div>

        {/* Pasos */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Pasos</label>
          {steps.map((step, i) => (
            <textarea
              key={i}
              rows="2"
              value={step}
              onChange={(e) => handleChangeStep(i, e.target.value)}
              placeholder={`Paso ${i + 1}`}
              className="mt-2 block w-full rounded-xl border border-gray-300 p-2 focus:ring-2 focus:ring-orange-400"
            />
          ))}
          <button
            type="button"
            onClick={handleAddStep}
            className="mt-2 text-orange-600 font-semibold hover:underline"
          >
            + Agregar paso
          </button>
        </div>

        {/* Botón enviar */}
        <button
          type="submit"
          className="w-full bg-orange-500 text-white py-2 rounded-xl font-bold hover:bg-orange-600 transition"
        >
          Crear receta
        </button>
      </form>
    </div>
  );
}