"use client";

import { useState } from "react"; // Import useState if needed for loading/error states
import { RestaurantData } from "@/types";
// import * as tus from "tus-js-client"; // Not directly used in this component
import { useUser, useSession } from "@clerk/nextjs";
import { handleOnboardingWithUpload } from "./action";
import { toast } from "sonner"; // Import toast for feedback

export default function Onboarding() {
  const { user, isLoaded: isUserLoaded } = useUser(); // Add isLoaded check
  const { session, isLoaded: isSessionLoaded } = useSession(); // Add isLoaded check
  const [isSubmitting, setIsSubmitting] = useState(false); // Optional: Loading state

  // handleSubmit needs to be async to await the token
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true); // Set loading state

    // 1. Check if session is loaded and exists
    if (!isSessionLoaded || !session) {
      toast.error("Sesión no cargada o no disponible. Intenta de nuevo.");
      setIsSubmitting(false);
      return;
    }

    // 2. Get the Supabase token using the correct template name
    let token: string | null = null;
    try {
      // *** IMPORTANT: Ensure you have a JWT template named "supabase" in Clerk ***
      token = await session.getToken({ template: "supabase" });
    } catch (error) {
      console.error("Error getting Supabase token from Clerk:", error);
      toast.error("Error al obtener token de autenticación.");
      setIsSubmitting(false);
      return;
    }

    // 3. Check if token was retrieved successfully
    if (!token) {
      toast.error("No se pudo obtener el token para Supabase.");
      setIsSubmitting(false);
      return;
    }

    // 4. Extract form data
    const formData = new FormData(event.currentTarget);
    const logoFile = formData.get("logo") as File | null; // Get file, check if null

    // Basic validation for required fields
    const restaurantName = formData.get("restaurantName") as string;
    if (!restaurantName) {
      toast.error("El nombre del restaurante es requerido.");
      setIsSubmitting(false);
      return;
    }
    if (!logoFile || logoFile.size === 0) {
      toast.error("El logo es requerido.");
      setIsSubmitting(false);
      return;
    }

    const newRestaurant: RestaurantData = {
      name: restaurantName,
      location: formData.get("location") as string,
      phoneNumber: formData.get("phone") as number | null, // Consider parsing as string first
      logo: logoFile, // Pass the File object
    };

    // 5. Call the server action with the data and the token string
    try {
      await handleOnboardingWithUpload(newRestaurant, token);
      // Server action handles success/error toasts internally now
      // Optionally reset form on success:
      // (event.target as HTMLFormElement).reset();
    } catch (error) {
      // Catch potential errors if the server action itself throws unexpectedly
      console.error("Error calling server action:", error);
      toast.error("Ocurrió un error inesperado al procesar el formulario.");
    } finally {
      setIsSubmitting(false); // Reset loading state regardless of outcome
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
