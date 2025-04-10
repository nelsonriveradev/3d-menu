// "use server";
// import { ItemInfo, ItemFiles } from "./page";
// import { createClient } from "@supabase/supabase-js";
// import { toast } from "sonner";
// //file object interface

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );
// export async function AddMenuItem(newItem: ItemInfo) {
//   try {
//     const { data, error } = await supabase
//       .from("menu_items")
//       .insert([
//         {
//           name: newItem.name,
//           description: newItem.description,
//           options: newItem.option,
//           price: newItem.price,
//           category: newItem.category,
//           calories: newItem.calories,
//           preparation_time: newItem.preparation_time,
//         },
//       ])
//       .select();

//     if (error) {
//       console.error(error);
//     }
//     console.log("Submitted to Supabase", data);
//     return { data };
//   } catch (error) {
//     console.log(error);
//   }
// }

// export async function uploadItemFiles(
//   newItemFiles: ItemFiles,
//   itemData: ItemInfo
// ) {
//   try {
//     if (!newItemFiles.objectGLB || !newItemFiles.objectUSDZ) {
//       throw new Error("Missing files for upload");
//     }

//     const objectGLBExtension = newItemFiles.objectGLB.name.split(".").pop();
//     const objectUSDZExtension = newItemFiles.objectUSDZ.name.split(".").pop();

//     const fileName = itemData.name;

//     console.log("Uploading files to Supabase storage...");
//     console.log("GLB File:", newItemFiles.objectGLB);
//     console.log("USDZ File:", newItemFiles.objectUSDZ);

//     const [objectGLB, objectUSDZ] = await Promise.all([
//       supabase.storage
//         .from("3d-objects")
//         .upload(`${fileName}-objects/model.glb`, newItemFiles.objectGLB, {
//           cacheControl: "3600",
//           upsert: true,
//           contentType: "model/gltf-binary",
//         }),
//       supabase.storage
//         .from("3d-objects")
//         .upload(`${fileName}-objects/model.usdz`, newItemFiles.objectUSDZ, {
//           cacheControl: "3600",
//           upsert: true,
//           contentType: "model/vnd.usdz+zip",
//         }),
//     ]);

//     if (objectGLB.error || objectUSDZ.error) {
//       console.error(
//         "Error uploading files:",
//         objectGLB.error,
//         objectUSDZ.error
//       );
//       toast.error("Error al subir archivos");
//       return;
//     }

//     console.log("Files uploaded successfully:", {
//       glb: objectGLB.data.path,
//       usdz: objectUSDZ.data.path,
//     });
//     toast.success("Archivos subidos correctamente.");
//   } catch (error) {
//     console.error("Error uploading files:", error);
//     toast.error("Lo siento, hubo un error al subir archivos");
//   }
// }

"use server";
// Assuming ItemInfo and ItemFiles interfaces are defined correctly elsewhere
// import { ItemInfo, ItemFiles } from "./page";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase URL or Anon Key is missing in environment variables."
  );
  // Handle error
}

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

const BUCKET_NAME = "3d-objects"; // Your bucket name

// --- Add Menu Item Action (Corrected .select()) ---
export async function AddMenuItem(newItem: /* ItemInfo */ any) {
  try {
    const { data, error } = await supabase
      .from("menu_items") // Your table name
      .insert([
        {
          // Ensure these field names match your ItemInfo and table columns
          name: newItem.name,
          description: newItem.description,
          options: newItem.option, // Assumes 'options' column is text[] or jsonb
          price: newItem.price,
          category: newItem.category,
          // objects: newItem.objects, // Add if you have an 'objects' field in ItemInfo
          calories: newItem.calories,
          preparation_time: newItem.preparation_time,
          // image_plate: newItem.image_plate, // Handle image URL if needed
        },
      ])
      .select("uid") // *** CHANGED: Select the 'uid' column ***
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return { error: `Database error: ${error.message}` };
    }
    // *** CHANGED: Check for data.uid ***
    if (!data?.uid) {
      return { error: "Failed to create menu item or retrieve UID." };
    }

    console.log("Menu Item Created in Supabase with UID:", data.uid);
    // *** CHANGED: Return data.uid ***
    // The client-side variable can still be called createdItemId, but it holds the UID value
    return { data: { id: data.uid } }; // Keep 'id' key consistent for client if preferred, but value is UID
  } catch (error: any) {
    console.error("Error in AddMenuItem:", error);
    return { error: error.message || "An unexpected error occurred." };
  }
}

// --- Simplified Preparation Action (Returns Paths and Public URLs) ---
export async function getItemFilePaths(menuItemUid: string) {
  try {
    if (!menuItemUid) {
      throw new Error("Menu Item UID is required.");
    }

    const basePath = `public/${menuItemUid}`; // Path uses the UID value
    const glbPath = `${basePath}/model.glb`;
    const usdzPath = `${basePath}/model.usdz`;

    // Generate the final public URLs
    const { data: glbPublicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(glbPath);
    const { data: usdzPublicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(usdzPath);
    const glbPublicUrl = glbPublicUrlData?.publicUrl;
    const usdzPublicUrl = usdzPublicUrlData?.publicUrl;

    if (!glbPublicUrl || !usdzPublicUrl) {
      throw new Error("Could not determine final public URLs.");
    }

    console.log(`Paths and URLs determined for UID: ${menuItemUid}`);

    // Return the necessary info for the client
    return {
      success: true,
      data: {
        glb: { publicUrl: glbPublicUrl, path: glbPath },
        usdz: { publicUrl: usdzPublicUrl, path: usdzPath },
      },
    };
  } catch (error: any) {
    console.error("Error in getItemFilePaths:", error);
    return {
      error: error.message || "An unexpected error occurred getting paths.",
    };
  }
}

// --- Action to Finalize Upload (Corrected DB Insert) ---
// The parameter menuItemId still holds the UID value
export async function finalizeItemFileUpload(
  menuItemId: string,
  glbPublicUrl: string,
  usdzPublicUrl: string
) {
  try {
    if (!menuItemId || !glbPublicUrl || !usdzPublicUrl) {
      throw new Error("Missing data to finalize file upload.");
    }

    console.log(`Finalizing file upload for item UID: ${menuItemId}`);

    // *** CHANGED: Insert into ar-models using correct column names ***
    const { error: arInsertError } = await supabase
      .from("ar-models") // Your AR models table name
      .insert([
        {
          menu_item_uid: menuItemId, // Use the correct foreign key column name
          file_url: glbPublicUrl,
          file_type: "glb", // Use the file_type column
        },
        {
          menu_item_uid: menuItemId, // Use the correct foreign key column name
          file_url: usdzPublicUrl,
          file_type: "usdz", // Use the file_type column
        },
      ]);

    if (arInsertError) {
      console.error("Error saving AR model URLs to database:", arInsertError);
      toast.error("Failed to save file URLs to database.");
      return {
        error: `Failed to save AR model URLs: ${arInsertError.message}`,
      };
    }

    console.log(`Successfully saved AR model URLs for item UID: ${menuItemId}`);
    toast.success("File URLs saved successfully.");
    return { success: true };
  } catch (error: any) {
    console.error("Error in finalizeItemFileUpload:", error);
    toast.error(`Error finalizing upload: ${error.message}`);
    return {
      error: error.message || "An unexpected error occurred finalizing upload.",
    };
  }
}
