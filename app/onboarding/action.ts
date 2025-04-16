"use server";
import { RestaurantData } from "@/types";
import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import * as tus from "tus-js-client";
import { toast } from "sonner"; // Assuming server-side toasts are intended

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseProjectId = process.env.NEXT_PUBLIC_PROJECT_ID; // Used for Tus endpoint

if (!supabaseUrl || !supabaseAnonKey || !supabaseProjectId) {
  console.error(
    "Supabase URL, Anon Key, or Project ID is missing in environment variables."
  );
  // Handle this critical configuration error
}

const BUCKET_NAME = "logos";

// --- Caller function (Corrected error handling) ---
export async function handleOnboardingWithUpload(
  formData: RestaurantData,
  sessionToken: string // Pass the token directly
) {
  // Basic validation on formData
  if (!formData.logo || !(formData.logo instanceof File)) {
    console.error("Invalid logo file provided.");
    toast.error("Por favor, proporciona un archivo de logo válido.");
    return; // Stop execution
  }
  if (!formData.name) {
    console.error("Restaurant name is missing.");
    toast.error("Por favor, proporciona el nombre del restaurante.");
    return; // Stop execution
  }

  try {
    // Show loading toast immediately before starting the process
    const uploadPromise = uploadLogoFile(
      formData.name,
      formData.logo.name,
      formData.logo,
      sessionToken // Pass the token string directly
    );

    toast.promise(uploadPromise, {
      loading: "Subiendo logo...",
      success: (url) => `Logo subido exitosamente!`, // URL available here if needed
      error: (err) =>
        `Error al subir logo: ${err.message || "Error desconocido"}`,
    });

    // Await the actual URL from the upload function
    const publicURL = await uploadPromise;

    // Check if upload succeeded (publicURL should be a string)
    if (typeof publicURL !== "string" || !publicURL) {
      // The toast might have already shown an error, but double-check
      console.error("Error al subir archivo: No se obtuvo URL pública.");
      // Avoid calling onboardingSubmitHandle if upload failed
      return;
    }

    // Proceed only if upload was successful
    await onboardingSubmitHandle(formData, publicURL);
  } catch (err: any) {
    // Catch errors from uploadLogoFile or onboardingSubmitHandle
    console.error("Onboarding process failed:", err);
    // Toast might have already shown, but maybe add a general failure message
    // toast.error(`Proceso fallido: ${err.message || 'Error desconocido'}`);
  }
}

// --- Upload Function (Corrected Promise Handling) ---
export async function uploadLogoFile(
  restaurantName: string,
  fileName: string,
  file: File,
  sessionToken: string | null // Expect the token string directly
): Promise<string | null> {
  // Explicitly define return type

  // Ensure necessary parameters are present
  if (!sessionToken) {
    console.error("Session token is required for upload.");
    return Promise.reject(new Error("Token de sesión requerido.")); // Reject promise
  }
  if (!supabaseProjectId) {
    console.error("Supabase Project ID is missing.");
    return Promise.reject(new Error("Configuración de Supabase incompleta."));
  }

  // Construct the object path and expected public URL beforehand
  const objectPath = `${restaurantName}/${fileName}`; // Use restaurantName for folder structure
  const supabase = createClient(supabaseUrl!, supabaseAnonKey!); // Can initialize here
  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(objectPath); // Get public URL based on the path

  const publicUrl = publicUrlData?.publicUrl;

  if (!publicUrl) {
    console.error(`Could not determine public URL for path: ${objectPath}`);
    return Promise.reject(new Error("No se pudo determinar la URL pública."));
  }

  // Return a new Promise that resolves with the publicUrl on success
  return new Promise<string>((resolve, reject) => {
    // Expect to resolve with string
    const upload = new tus.Upload(file, {
      endpoint: `https://${supabaseProjectId}.supabase.co/storage/v1/upload/resumable`,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${sessionToken}`,
        "x-upsert": "true", // Use this to overwrite existing files with the same name
      },
      // uploadDataDuringCreation: true, // Often not needed with Supabase Tus endpoint
      removeFingerprintOnSuccess: true, // Good practice
      metadata: {
        bucketName: BUCKET_NAME,
        objectName: objectPath, // Use the calculated path
        contentType: file.type, // *** Use the actual file type ***
        cacheControl: "3600",
      },
      chunkSize: 6 * 1024 * 1024, // 6MB chunks
      onError: function (error) {
        console.error("Tus Upload Failed:", error);
        // Reject the promise with the error
        reject(error);
      },
      onProgress: function (bytesUploaded, bytesTotal) {
        let percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
        console.log(
          `Uploading ${fileName}: ${bytesUploaded} / ${bytesTotal} (${percentage}%)`
        );
        // You could potentially update progress state here if needed elsewhere
      },
      onSuccess: function () {
        console.log(`Tus Upload Succeeded: ${fileName}, URL: ${upload.url}`);
        // *** Resolve the promise WITH the publicUrl ***
        resolve(publicUrl);
      },
    });

    // Check if resumable upload is possible
    upload
      .findPreviousUploads()
      .then(function (previousUploads) {
        if (previousUploads.length) {
          console.log(`Resuming upload for ${fileName} from previous state.`);
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }
        // Start the upload
        console.log(`Starting upload for ${fileName}...`);
        upload.start();
      })
      .catch((err) => {
        // Handle errors finding previous uploads (e.g., network issue)
        console.error("Error finding previous uploads, starting fresh:", err);
        console.log(`Starting fresh upload for ${fileName}...`);
        upload.start(); // Start a fresh upload if finding previous failed
      });
  }); // End of new Promise
}

// --- Onboarding Submit Function (Corrected Type Signature) ---
export async function onboardingSubmitHandle(
  newRestaurantInsert: RestaurantData,
  fileURL: string | null // Expect the resolved URL string, not a Promise
) {
  const user = await currentUser(); // Ensure Clerk context is available here
  if (!user?.id) {
    console.error("User not found or Clerk context unavailable.");
    toast.error("Error de autenticación, por favor intenta de nuevo.");
    return;
  }
  if (!fileURL) {
    console.error("File URL is missing, cannot submit onboarding data.");
    toast.error("Error con la URL del logo, no se pudo registrar.");
    return;
  }

  const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

  // Ensure your 'restaurants' table has a 'user_id' column to link to Clerk user
  const { error } = await supabase.from("restaurants").insert([
    // *** Check table name ***
    {
      user_id: user.id, // *** Link to Clerk user ID ***
      name: newRestaurantInsert.name,
      location: newRestaurantInsert.location,
      cell_number: newRestaurantInsert.phoneNumber,
      logo_url: fileURL, // *** Store the actual URL string *** (Changed column name example)
    },
  ]);

  if (error) {
    console.error("Error inserting restaurant:", error);
    toast.error(`Error al registrar restaurante: ${error.message}`);
  } else {
    toast.success("Restaurante registrado exitosamente.");
    // Optionally: Redirect user or perform other actions
  }
}
