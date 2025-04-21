"use client";
import { useState, useTransition, useEffect } from "react";
import { useParams } from "next/navigation";
import * as tus from "tus-js-client";
// Import the server actions
import {
  AddMenuItem,
  getItemFilePaths,
  finalizeItemFileUpload,
} from "./action"; // Ensure this path is correct
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  //params
  const { slug } = useParams();
  const [tab, setTab] = useState<string>("details");
  const [options, setOptions] = useState<string[]>([]);
  // This state variable will hold the UID value returned from AddMenuItem
  const [createdItemId, setCreatedItemId] = useState<string | null>(null);
  // Loading states
  const [isSubmittingDetails, startDetailsTransition] = useTransition();
  const [isUploadingFiles, startUploadTransition] = useTransition();
  const [supabase, setSupabase] = useState<ReturnType<
    typeof createClient
  > | null>(null);

  useEffect(() => {
    setSupabase(createClient()); // Initialize Supabase client on component mount
  }, []);
  // optionHandle remains the same
  function optionHandle(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const inputOption = event.currentTarget
      .previousElementSibling as HTMLInputElement;
    const option = inputOption.value.trim();

    setOptions((prevOptions) => {
      const alreadyOption = prevOptions.includes(option);
      if (!alreadyOption && option) {
        // Ensure option is not empty
        return [...prevOptions, option];
      } else if (alreadyOption) {
        toast.warning(`Opcion ya está en lista: ${option}`);
        return prevOptions;
      }
      return prevOptions; // Return current state if option is empty
    });

    inputOption.value = "";
  }

  // File submission function (No changes needed related to ID/UID)
  async function fileObjectSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Ensure Supabase client and keys are available
    if (!supabase || !supabaseUrl || !supabaseAnonKey) {
      toast.error("Supabase client no inicializado correctamente.");
      return;
    }

    if (!createdItemId) {
      toast.error("Primero debes completar y guardar los detalles del plato.");
      setTab("details");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const objectGLBFile = formData.get("objectGLB") as File | null;
    const objectUSDZFile = formData.get("objectUSDZ") as File | null;

    if (!objectGLBFile || objectGLBFile.size === 0) {
      /* ... error handling ... */ return;
    }
    if (!objectUSDZFile || objectUSDZFile.size === 0) {
      /* ... error handling ... */ return;
    }

    startUploadTransition(async () => {
      let pathData: FilePathData | null = null;
      let glbUploadSuccess = false;
      let usdzUploadSuccess = false;

      try {
        // --- Get Access Token ---
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError || !session?.access_token) {
          throw new Error(
            sessionError?.message || "No se pudo obtener la sesión del usuario."
          );
        }
        const supabaseAccessToken = session.access_token;

        // --- Get Target Paths ---
        toast.info("Obteniendo rutas de archivo...");
        const pathResult = await getItemFilePaths(createdItemId); // Use the new action

        if (pathResult?.error || !pathResult?.data) {
          throw new Error(
            pathResult?.error || "No se pudieron obtener las rutas de archivo."
          );
        }
        pathData = pathResult.data;
        toast.info("Rutas obtenidas. Subiendo archivos...");

        // --- Configure Tus Endpoint ---
        const tusEndpoint = `${supabaseUrl}/storage/v1/upload/resumable`;

        // --- Use tus-js-client for uploads ---
        const uploadPromises = [
          // GLB Upload Promise
          new Promise<void>((resolve, reject) => {
            const glbUpload = new tus.Upload(objectGLBFile, {
              endpoint: tusEndpoint, // Standard endpoint
              retryDelays: [0, 3000, 5000, 10000, 20000],
              headers: {
                // --- Authorization Headers ---
                Authorization: `Bearer ${supabaseAccessToken}`,
                apikey: supabaseAnonKey, // Public anon key
                // 'x-upsert': 'true', // Optional: Check Supabase Tus docs if needed
              },
              metadata: {
                // --- Metadata for Supabase ---
                bucketName: BUCKET_NAME,
                objectName: pathData!.glb.path, // Target path
                contentType: "model/gltf-binary", // Set content type
                // cacheControl: '3600', // Optional
              },
              chunkSize: 6 * 1024 * 1024, // Example chunk size
              onError: (error) =>
                reject(
                  new Error(`Error al subir GLB: ${error.message || error}`)
                ),
              onProgress: (bytesUploaded, bytesTotal) =>
                console.log(
                  `GLB: ${((bytesUploaded / bytesTotal) * 100).toFixed(2)}%`
                ),
              onSuccess: () => {
                glbUploadSuccess = true;
                resolve();
              },
            });
            glbUpload.start();
          }),
          // USDZ Upload Promise
          new Promise<void>((resolve, reject) => {
            const usdzUpload = new tus.Upload(objectUSDZFile, {
              endpoint: tusEndpoint, // Standard endpoint
              retryDelays: [0, 3000, 5000, 10000, 20000],
              headers: {
                Authorization: `Bearer ${supabaseAccessToken}`,
                apikey: supabaseAnonKey,
                // 'x-upsert': 'true',
              },
              metadata: {
                bucketName: BUCKET_NAME,
                objectName: pathData!.usdz.path, // Target path
                contentType: "model/vnd.usdz+zip", // Set content type
                // cacheControl: '3600',
              },
              chunkSize: 6 * 1024 * 1024,
              onError: (error) =>
                reject(
                  new Error(`Error al subir USDZ: ${error.message || error}`)
                ),
              onProgress: (bytesUploaded, bytesTotal) =>
                console.log(
                  `USDZ: ${((bytesUploaded / bytesTotal) * 100).toFixed(2)}%`
                ),
              onSuccess: () => {
                usdzUploadSuccess = true;
                resolve();
              },
            });
            usdzUpload.start();
          }),
        ];

        await Promise.all(uploadPromises);

        if (!glbUploadSuccess || !usdzUploadSuccess) {
          throw new Error("Uno o más archivos no se subieron correctamente.");
        }

        toast.success("Archivos subidos correctamente. Finalizando...");

        // Finalize Upload (Pass UID and public URLs from pathData)
        const finalizeResult = await finalizeItemFileUpload(
          createdItemId!,
          pathData.glb.publicUrl,
          pathData.usdz.publicUrl
        );

        if (finalizeResult?.error) {
          throw new Error(
            finalizeResult.error || "Error al guardar URLs en la base de datos."
          );
        }

        toast.success("¡Plato y modelos 3D añadidos con éxito!");
        // Reset state...
        setCreatedItemId(null);
        setOptions([]);
        (event.target as HTMLFormElement).reset();
        setTab("details");
      } catch (error: any) {
        console.error("Error during file upload process:", error);
        toast.error(`Error: ${error.message}`);
      }
    }); // End startUploadTransition
  }
  // Details submission function (No changes needed related to ID/UID)
  async function mainDetailsSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setCreatedItemId(null); // Reset just in case

    const newItem: ItemInfo = {
      name: formData.get("plateName") as string,
      description: formData.get("description") as string,
      option: options,
      price: parseFloat(formData.get("price") as string) || 0,
      category: formData.get("category") as string,
      calories: parseInt(formData.get("calories") as string) || 0,
      preparation_time: formData.get("time") as string,
      image_plate: formData.get("image_plate") as File | null,
    };

    startDetailsTransition(async () => {
      try {
        const response = await AddMenuItem(newItem, slug);

        // response.data.id now correctly contains the UID value from the server
        if (response?.error || !response?.data?.id) {
          return console.error(
            response?.error,
            "No se pudo crear el plato o obtener ID."
          );
        }

        // Store the UID value in createdItemId state
        const itemId = response.data.id; // This variable holds the UID
        setCreatedItemId(itemId);
        setTab("files");
        console.log("Item created with UID:", itemId); // Log UID
        toast.success("Detalles guardados. Ahora sube los archivos 3D.");
      } catch (error: any) {
        console.error("Error submitting item details:", error);
        toast.error(`Error al guardar detalles: ${error.message}`);
        setCreatedItemId(null);
      }
    });
  }

  // --- RETURN JSX (No changes needed related to ID/UID) ---
  return (
    <div>
      <div className="">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="">
            <TabsTrigger value="details">Detalles del Plato</TabsTrigger>
            <TabsTrigger value="files" disabled={!createdItemId}>
              Archivos 3D
            </TabsTrigger>
          </TabsList>

          {/* Form main details */}
          <TabsContent value="details">
            <form
              onSubmit={mainDetailsSubmit}
              className="bg-zinc-300  rounded-2xl py-2 px-4 flex flex-col justify-evenly gap-y-3"
            >
              {/* ... Input fields ... */}
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
                  name="category" // Ensure name matches server expectation if needed
                  placeholder="Pasta en salsa de la casa"
                  className="bg-zinc-500 text-zinc-100 rounded-lg px-2 py-1 "
                />
              </div>
              <div className="flex flex-col justify-center w-full">
                <label className="font-semibold">opciones</label>
                <div className="flex w-full gap-x-5">
                  <input
                    // name="options" - Input is just for typing, state holds value
                    placeholder="extra salsa"
                    className="bg-zinc-500 text-zinc-100 rounded-lg px-2 py-1 "
                  />
                  <button
                    onClick={optionHandle}
                    className="text-zinc-100 bg-zinc-800 px-2 py-1 rounded-lg"
                  >
                    Añadir option
                  </button>
                </div>
                {/* Option Array */}
                <div className="flex gap-x-2 flex-wrap">
                  {options.map((optionItem) => (
                    <p key={optionItem}>{optionItem}</p>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <label className="font-semibold">Precio</label>
                <input
                  name="price"
                  type="number" // Use number type for price
                  step="0.01" // Allow decimals
                  placeholder="10.99"
                  className="bg-zinc-500 text-zinc-100 rounded-lg px-2 py-1 "
                />
              </div>
              <div className="flex gap-x-2">
                <div className="flex flex-col justify-center">
                  <label className="font-semibold">Calorias</label>
                  <input
                    name="calories"
                    type="number" // Use number type
                    placeholder="100"
                    className="w-1/2 bg-zinc-500 text-zinc-100 rounded-lg px-2 py-1 "
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <label className="font-semibold">Tiempo de preparación</label>
                  <input
                    name="time"
                    type="text"
                    placeholder="15 min" // More descriptive placeholder
                    className="w-1/2 bg-zinc-500 text-zinc-100 rounded-lg px-2 py-1 "
                  />
                </div>
              </div>
              <div className="flex flex-col justify-center w-1/2">
                <label className="font-semibold">Imagen del Plato</label>
                <input
                  name="image_plate" // Add name if handling image upload
                  type="file"
                  accept="image/*" // Accept images
                  className="bg-zinc-500 text-zinc-100 rounded-lg px-2 py-1 "
                />
              </div>
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmittingDetails}
                className="cursor-pointer px-4 py-2 text-zinc-100 bg-zinc-700 rounded-2xl transition-all duration-100 ease-in-out active:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingDetails
                  ? "Guardando..."
                  : "Guardar Detalles y Continuar"}
              </button>
            </form>
          </TabsContent>

          {/* Files Tab Content */}
          <TabsContent value="files">
            <form onSubmit={fileObjectSubmit}>
              <h1 className="text-2xl font-semibold text-center">
                Objectos 3D
              </h1>
              <p className="text-center text-sm text-gray-600 mb-4">
                {createdItemId
                  ? `Subiendo archivos para el plato UID: ${createdItemId.substring(
                      0,
                      8
                    )}...`
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
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isUploadingFiles || !createdItemId}
                className="cursor-pointer mt-4 px-4 py-2 text-zinc-100 bg-zinc-700 rounded-2xl transition-all duration-100 ease-in-out active:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploadingFiles ? "Subiendo..." : "Subir Archivos 3D"}
              </button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
