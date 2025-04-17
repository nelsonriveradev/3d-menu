"use client";
import * as tus from "tus-js-client";
import { useState, useRef } from "react"; // Import useState if needed for loading/error states
import { RestaurantData } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
// import * as tus from "tus-js-client"; // Not directly used in this component
import { useUser, useSession } from "@clerk/nextjs";
import {
  createRestaurantRecord,
  getLogoUploadPathInfo,
  finalizeLogoUpload,
} from "./action";
import { toast } from "sonner";
import { redirect } from "next/navigation";
// Import toast for feedback
// Supabase constants from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const BUCKET_NAME = "logos"; // Match server-side

export default function Onboarding() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { session, isLoaded: isSessionLoaded } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formRef.current) return;
    if (!isSessionLoaded || !session || !supabaseUrl || !supabaseAnonKey) {
      toast.error("Cliente no listo o configuración incompleta.");
      return;
    }

    setIsSubmitting(true);
    let restaurantId: string | null = null; // To store the ID
    let pathInfo: { path: string; publicUrl: string } | null = null;
    let tusUploadSuccess = false;

    const formData = new FormData(formRef.current);
    const logoFile = formData.get("logo") as File | null;
    const restaurantName = formData.get("restaurantName") as string;

    // --- Validations ---
    if (!restaurantName) {
      toast.error("Nombre requerido.");
      setIsSubmitting(false);
      return;
    }
    if (!logoFile || logoFile.size === 0) {
      toast.error("Logo requerido.");
      setIsSubmitting(false);
      return;
    }

    const newRestaurantDetails: Omit<RestaurantData, "logo"> = {
      name: restaurantName,
      location: formData.get("location") as string,
      phoneNumber: formData.get("phone") as number | null, // Consider parsing
    };

    try {
      // --- Stage 1: Create Restaurant Record ---
      toast.info("Registrando detalles del restaurante...");
      const createResult = await createRestaurantRecord(newRestaurantDetails);
      if (createResult?.error || !createResult?.restaurantId) {
        throw new Error(
          createResult?.error || "No se pudo crear el registro del restaurante."
        );
      }
      restaurantId = createResult.restaurantId;
      toast.success("Detalles guardados. Preparando subida de logo...");

      // --- Stage 2: Get Upload Path Info ---
      const pathResult = await getLogoUploadPathInfo(
        restaurantId!,
        restaurantName,
        logoFile.name
      );
      if (pathResult?.error || !pathResult?.path || !pathResult?.publicUrl) {
        throw new Error(
          pathResult?.error ||
            "No se pudo obtener la información para subir el logo."
        );
      }
      pathInfo = { path: pathResult.path, publicUrl: pathResult.publicUrl };

      // --- Stage 3: Get Supabase Token ---
      const supabaseAccessToken = await session?.getToken();

      if (!supabaseAccessToken) {
        toast.error("Error de autenticación: No se pudo obtener el token.");
        return;
      }
      toast.info("Token obtenido. Subiendo logo...");

      // --- Stage 4: Perform Tus Upload ---
      await new Promise<void>((resolve, reject) => {
        const tusEndpoint = `${supabaseUrl}/storage/v1/upload/resumable`;
        const upload = new tus.Upload(logoFile, {
          endpoint: tusEndpoint,
          retryDelays: [0, 3000, 5000, 10000, 20000],
          headers: {
            Authorization: `Bearer ${supabaseAccessToken}`,
            apikey: supabaseAnonKey,
            // 'x-upsert': 'true', // Optional
          },
          metadata: {
            bucketName: BUCKET_NAME,
            objectName: pathInfo!.path, // Use path from server
            contentType: logoFile.type,
            // cacheControl: '3600',
          },
          chunkSize: 6 * 1024 * 1024,
          onError: (error) =>
            reject(new Error(`Error al subir logo: ${error.message || error}`)),
          onProgress: (bytesUploaded, bytesTotal) =>
            console.log(
              `Logo: ${((bytesUploaded / bytesTotal) * 100).toFixed(2)}%`
            ),
          onSuccess: () => {
            tusUploadSuccess = true;
            resolve();
          },
        });
        upload.start();
      }); // End Tus Promise

      if (!tusUploadSuccess) {
        // Should have been caught by reject, but double-check
        throw new Error("La subida del logo falló silenciosamente.");
      }
      toast.success("Logo subido. Guardando enlace...");

      // --- Stage 5: Finalize - Update DB with URL ---
      const finalizeResult = await finalizeLogoUpload(
        restaurantId!,
        restaurantName,
        pathInfo.publicUrl
      );
      if (finalizeResult?.error) {
        throw new Error(
          finalizeResult.error ||
            "Error al guardar la URL del logo en la base de datos."
        );
      }

      toast.success("¡Restaurante y logo configurados con éxito!");
      formRef.current?.reset();
      redirect("/admin");
    } catch (error: any) {
      console.error("Onboarding process failed:", error);
      toast.error(`Error: ${error.message}`);
      // Consider cleanup steps if partial success (e.g., restaurant created but upload failed)
    } finally {
      setIsSubmitting(false);
    }
  }

  // Optional: Show loading state or disable form while loading user/session
  if (!isUserLoaded || !isSessionLoaded) {
    return <div>Cargando...</div>; // Or a spinner component
  }

  return (
    <div className="">
      <div className="flex flex-col items-center border-2 border-zinc-500 rounded-2xl px-4 py-4">
        <h1 className="text-3xl font-bold text-center">
          ¡Bienvenidos a Better Menu!
        </h1>
        <p className="text-lg font-medium text-center text-zinc-600 mt-4">
          Vamos a comenzar con crear tu restaurante en la plataforma
        </p>

        {/* Use the onSubmit handler */}
        <form
          ref={formRef}
          onSubmit={handleSubmit} // Attach the handler here
          className="bg-zinc-200 px-2.5 py-2 rounded-2xl flex flex-col gap-y-4 w-full mt-6" // Added margin-top
        >
          <p className="mb-5 text-sm text-zinc-700">
            Favor de insertar la informacion correcta.
          </p>
          {/* nombre */}
          <div className="flex flex-col gap-y-1">
            <label htmlFor="restaurantName" className="text-sm font-medium">
              Nombre del restaurante
            </label>
            <input
              id="restaurantName"
              required // Add required attribute
              className="bg-white text-zinc-800 rounded-lg px-2 py-1 border border-zinc-300 focus:ring-2 focus:ring-blue-500 focus:outline-none" // Improved styling
              type="text"
              placeholder="Mi Restaurante"
              name="restaurantName"
            />
          </div>
          {/* Location */}
          <div className="flex flex-col gap-y-1">
            <label htmlFor="location" className="text-sm font-medium">
              Lugar
            </label>
            <input
              id="location"
              className="bg-white text-zinc-800 rounded-lg px-2 py-1 border border-zinc-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              type="text"
              placeholder="San Juan, Puerto Rico"
              name="location"
            />
          </div>
          {/* Phone */}
          <div className="flex flex-col gap-y-1">
            <label htmlFor="phone" className="text-sm font-medium">
              Teléfono
            </label>
            <input
              id="phone"
              className="bg-white text-zinc-800 rounded-lg px-2 py-1 border border-zinc-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              type="tel" // Use tel type
              placeholder="787-123-4567"
              name="phone"
            />
          </div>
          {/* Logo */}
          <div className="flex flex-col gap-y-1">
            <label htmlFor="logo" className="text-sm font-medium">
              Añade tu logo
            </label>
            <input
              id="logo"
              required // Add required attribute
              className="bg-white text-zinc-800 rounded-lg px-2 py-1 border border-zinc-300 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" // File input styling
              type="file"
              accept="image/png, image/jpeg, image/webp" // Accept common image types
              name="logo"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Archivos PNG, JPG, WEBP permitidos.
            </p>
          </div>
          {/* Submit Button */}
          <button
            type="submit" // Explicit type
            disabled={isSubmitting} // Disable button when submitting
            className="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed" // Improved styling
          >
            {isSubmitting ? "Creando..." : "Crear restaurante"}
          </button>
        </form>
      </div>
    </div>
  );
}
