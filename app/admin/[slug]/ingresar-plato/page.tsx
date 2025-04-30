"use client";
import { useState, useTransition, useEffect, ChangeEvent } from "react";
import { useParams } from "next/navigation";
import * as tus from "tus-js-client";
// Import the server actions
import {
  AddMenuItem,
  getItemFilePaths,
  finalizeItemFileUpload,
} from "./action"; // Ensure this path is correct
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase/supabaseClient";

// Interfaces (keep as they are)
export interface ItemFiles {
  objectGLB?: File | null;
  objectUSDZ?: File | null;
}

export interface ItemInfo {
  name: string;
  description: string;
  option?: string[];
  price: number;
  category?: string;
  calories?: number;
  servings?: number; // This field wasn't in your schema, remove if not needed
  preparation_time?: string;
  image_plate?: string | File | null; // Handle image upload if needed
}

// Define the expected structure of the data returned by prepareItemFileUploads
interface FilePathData {
  glb: { publicUrl: string; path: string };
  usdz: { publicUrl: string; path: string };
}
// Define Supabase constants from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const BUCKET_NAME = "3d-objects"; // Match server-side
export default function Admin() {
  //params - Keep if slug is needed for display or static links
  const { slug } = useParams();
  // Basic UI state like the active tab can remain
  const [tab, setTab] = useState<string>("details");
  // State for created item ID might be useful to keep disabled state logic, or remove if starting completely fresh
  const [createdItemId, setCreatedItemId] = useState<string | null>(null); // Example: Keep for disabled state

  // --- ALL FUNCTIONS REMOVED ---
  // - useEffect hooks
  // - optionHandle
  // - fileObjectSubmit
  // - mainDetailsSubmit
  // - fetchCategory
  // - onChangeCategoryHandle

  // --- RETURN JSX (Event handlers and dynamic values removed/reset) ---
  return (
    <div>
      <div className="">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="">
            <TabsTrigger value="details">Detalles del Plato</TabsTrigger>
            {/* Example: Keep disabled logic based on a simplified state */}
            <TabsTrigger value="files" disabled={!createdItemId}>
              Archivos 3D
            </TabsTrigger>
          </TabsList>

          {/* Form main details */}
          <TabsContent value="details">
            {/* Removed onSubmit */}
            <form className="bg-zinc-300  rounded-2xl py-2 px-4 flex flex-col justify-evenly gap-y-3">
              {/* Input fields - Removed value bindings and onChange handlers calling complex logic */}
              <div className="flex flex-col justify-center">
                <label className="font-semibold">Nombre del Plato</label>
                <input
                  required
                  name="plateName"
                  type="text"
                  placeholder="Pasta en salsa de la casa"
                  className="bg-zinc-500 text-zinc-100 rounded-lg px-2 py-1 "
                />
              </div>
              <div className="flex flex-col justify-center">
                <label className="font-semibold">Descripción</label>
                <textarea
                  name="description"
                  placeholder="Pasta en salsa de la casa"
                  className="bg-zinc-500 text-zinc-100 rounded-lg px-2 py-1 "
                />
              </div>
              <div className="flex flex-col justify-center">
                <label className="font-semibold">Categoria</label>
                <input
                  name="category"
                  // value={categoryInput} // Removed state binding
                  placeholder="Escribe o selecciona categoria"
                  className="bg-zinc-500 text-zinc-100 rounded-lg px-2 py-1 "
                  // onChange={(e) => setCategoryInput(e.target.value)} // Removed state update
                />
                {/* Removed suggestions list */}
              </div>
              <div className="flex flex-col justify-center w-full">
                <label className="font-semibold">opciones</label>
                <div className="flex w-full gap-x-5">
                  <input
                    placeholder="extra salsa"
                    className="bg-zinc-500 text-zinc-100 rounded-lg px-2 py-1 "
                  />
                  {/* Removed onClick */}
                  <button
                    type="button" // Change to type="button" if not submitting
                    className="text-zinc-100 bg-zinc-800 px-2 py-1 rounded-lg"
                  >
                    Añadir option
                  </button>
                </div>
                {/* Removed options list */}
                <div className="flex gap-x-2 flex-wrap">
                  {/* Placeholder for where options would go */}
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <label className="font-semibold">Precio</label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder="10.99"
                  className="bg-zinc-500 text-zinc-100 rounded-lg px-2 py-1 "
                />
              </div>
              <div className="flex gap-x-2">
                <div className="flex flex-col justify-center">
                  <label className="font-semibold">Calorias</label>
                  <input
                    name="calories"
                    type="number"
                    placeholder="100"
                    className="w-1/2 bg-zinc-500 text-zinc-100 rounded-lg px-2 py-1 "
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <label className="font-semibold">Tiempo de preparación</label>
                  <input
                    name="time"
                    type="text"
                    placeholder="15 min"
                    className="w-1/2 bg-zinc-500 text-zinc-100 rounded-lg px-2 py-1 "
                  />
                </div>
              </div>
              <div className="flex flex-col justify-center w-1/2">
                <label className="font-semibold">Imagen del Plato</label>
                <input
                  name="image_plate"
                  type="file"
                  accept="image/*"
                  className="bg-zinc-500 text-zinc-100 rounded-lg px-2 py-1 "
                />
              </div>
              {/* Submit Button - Removed disabled state based on transition */}
              <button
                type="submit"
                // disabled={isSubmittingDetails} // Removed
                className="cursor-pointer px-4 py-2 text-zinc-100 bg-zinc-700 rounded-2xl transition-all duration-100 ease-in-out active:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* Static text */}
                Guardar Detalles y Continuar
              </button>
            </form>
          </TabsContent>

          {/* Files Tab Content */}
          <TabsContent value="files">
            {/* Removed onSubmit */}
            <form>
              <h1 className="text-2xl font-semibold text-center">
                Objectos 3D
              </h1>
              <p className="text-center text-sm text-gray-600 mb-4">
                {/* Simplified message or remove */}
                {createdItemId
                  ? `Subiendo archivos para el plato...`
                  : "Completa los detalles primero."}
              </p>
              <div className="flex gap-x-2 mx-auto bg-zinc-300  rounded-2xl py-2 px-4  justify-center gap-y-3">
                {/* USDZ Input */}
                <div className="flex flex-col justify-center w-1/2">
                  <label className="font-semibold">Tipo .usdz</label>
                  <input
                    required
                    name="objectUSDZ"
                    type="file"
                    accept=".usdz"
                    className="w-2/3 bg-zinc-500 text-zinc-100 rounded-lg px-2 py-1 "
                  />
                </div>
                {/* GLB Input */}
                <div className="flex flex-col justify-center w-1/2">
                  <label className="font-semibold">Tipo .glb</label>
                  <input
                    required
                    name="objectGLB"
                    type="file"
                    accept=".glb,.gltf"
                    className="w-2/3 bg-zinc-500 text-zinc-100 rounded-lg px-2 py-1 "
                  />
                </div>
              </div>
              {/* Submit Button - Removed disabled state based on transition */}
              <button
                type="submit"
                // disabled={isUploadingFiles || !createdItemId} // Removed
                disabled={!createdItemId} // Example: Keep basic disabled logic
                className="cursor-pointer mt-4 px-4 py-2 text-zinc-100 bg-zinc-700 rounded-2xl transition-all duration-100 ease-in-out active:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* Static text */}
                Subir Archivos 3D
              </button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
