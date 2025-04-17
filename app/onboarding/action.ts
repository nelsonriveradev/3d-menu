"use server";

import { RestaurantData } from "@/types";
import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Use Service Role Key for backend operations
const supabaseServiceRoleKey =
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Supabase URL or Service Role Key missing.");
  // Handle error
}

// Initialize Admin Client
const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceRoleKey!, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

const BUCKET_NAME = "logos";

// --- Action to create Restaurant record (WITHOUT logo initially) ---
export async function createRestaurantRecord(
  newRestaurantData: Omit<RestaurantData, "logo"> // Expect data without the logo File object
) {
  const user = await currentUser();
  if (!user?.id) {
    return { error: "Error de autenticación." };
  }

  try {
    console.log(`Creating restaurant record for user: ${user.id}`);
    const { data, error } = await supabaseAdmin
      .from("restaurants") // Your table name
      .insert([
        {
          user_id: user.id, // Link to Clerk user
          name: newRestaurantData.name,
          location: newRestaurantData.location,
          cell_number: newRestaurantData.phoneNumber,
          // logo_url: null, // Initially null or omit if nullable
        },
      ])
      .select() // Select the ID of the newly created restaurant
      .single();

    if (error) {
      console.error("Error inserting restaurant:", error);
      // Check for unique constraint violation if name should be unique per user etc.
      if (error.code === "23505") {
        // Example: unique violation code
        return {
          error: `Error: Ya existe un restaurante con datos similares.`,
        };
      }
      return { error: `Error al registrar restaurante: ${error.message}` };
    }
    if (!data?.id) {
      return { error: "No se pudo obtener el ID del restaurante creado." };
    }

    console.log("Restaurant record created successfully:", data);
    // Return the new restaurant ID
    return { success: true, restaurantId: data.id, restaurantName: data.name };
  } catch (error: any) {
    console.error("Unexpected error creating restaurant record:", error);
    return { error: `Error inesperado: ${error.message}` };
  }
}

// --- Action to get Upload Path and Public URL ---
// Client calls this *after* creating the restaurant record to know where to upload
export async function getLogoUploadPathInfo(
  restaurantId: string | number,
  restaurantName: string | null,
  fileName: string
) {
  const user = await currentUser();
  if (!user?.id) return { error: "Error de autenticación." };

  // Optional: Verify user owns this restaurantId before proceeding
  // const { count, error } = await supabaseAdmin.from('restaurants').select('id', { count: 'exact'}).eq('id', restaurantId).eq('user_id', user.id);
  // if (error || count !== 1) return { error: "Restaurante no encontrado o no autorizado." };

  // Construct path (e.g., using restaurant ID for uniqueness)
  const objectPath = `restaurant-${restaurantId}-${restaurantName}/${fileName}`;

  // Get the final public URL
  const { data: publicUrlData } = supabaseAdmin.storage
    .from(BUCKET_NAME)
    .getPublicUrl(objectPath);

  const publicUrl = publicUrlData?.publicUrl;

  if (!publicUrl) {
    return { error: "No se pudo determinar la URL pública del logo." };
  }

  return { success: true, path: objectPath, publicUrl: publicUrl };
}

// --- Action to UPDATE restaurant with logo URL (called AFTER client upload) ---
export async function finalizeLogoUpload(
  restaurantId: string | number,
  restaurantName: string | null,
  logoPublicUrl: string
) {
  const user = await currentUser();
  if (!user?.id) {
    return { error: "Error de autenticación." };
  }
  if (!logoPublicUrl) {
    return { error: "URL del logo no proporcionada." };
  }

  try {
    console.log(
      `Updating restaurant ${restaurantId}-${restaurantName} with logo URL: ${logoPublicUrl}`
    );
    const { data, error } = await supabaseAdmin
      .from("restaurants")
      .update({ logo_url: logoPublicUrl }) // Your logo URL column name
      .eq("id", restaurantId) // Match the restaurant ID
      .eq("user_id", user.id) // Ensure user owns this restaurant
      .select("id") // Select something to confirm success
      .single();

    if (error) {
      console.error("Error updating restaurant with logo URL:", error);
      return { error: `Error al guardar URL del logo: ${error.message}` };
    }
    if (!data?.id) {
      return { error: "No se pudo confirmar la actualización del logo." };
    }

    console.log("Restaurant logo URL updated successfully for ID:", data.id);
    return { success: true };
  } catch (error: any) {
    console.error("Unexpected error finalizing logo upload:", error);
    return { error: `Error inesperado: ${error.message}` };
  }
}
