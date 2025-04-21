"use server";
// Assuming ItemInfo and ItemFiles interfaces are defined correctly elsewhere
// import { ItemInfo, ItemFiles } from "./page";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase/supabaseClient";

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey =
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase URL or Anon Key is missing in environment variables."
  );
  // Handle error
}

const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceRoleKey!, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

const BUCKET_NAME = "3d-objects"; // Your bucket name

// upload image
async function imageUpload(
  image: File,
  restaurantName: string,
  itemName: string
) {
  try {
    const fileName = image.name;
    const sanitizedRestaurantName = restaurantName.replace(
      /[^a-zA-Z0-9-_]/g,
      "_"
    );
    const sanitizedItemName = itemName.replace(/[^a-zA-Z0-9-_]/g, "_");
    const filePath = `${sanitizedRestaurantName}/${sanitizedItemName}/${fileName}`;
    console.log(`Uploading image to path: ${filePath}`);
    const { data: plateUpload, error: plateErrorUpload } =
      await supabaseAdmin.storage.from("plates").upload(filePath, image, {
        contentType: image.type,
      });
    if (plateUpload) {
      console.log("succesfully upload!!!!!");
    }
    if (plateErrorUpload) {
      console.log(
        "Error uploading image Plate to storage bucket",
        plateErrorUpload
      );
    }

    // get url
    const IMGURL = plateUpload?.path;
    if (!IMGURL) {
      console.error(
        "Failed to upload image: plateUpload is null or undefined."
      );
    }
    const { data: imageURL } = IMGURL
      ? supabase.storage.from("plates").getPublicUrl(IMGURL)
      : { data: null };

    return { plateUpload, imageURL };
  } catch (error) {
    console.log("Error encontrado en subir foto: ", error);
  }
}

// --- Add Menu Item Action (Corrected .select()) ---
export async function AddMenuItem(newItem: /* ItemInfo */ any, slug: any) {
  try {
    const { userId } = await auth();
    if (!userId) {
      console.error("Authentication error: User ID not found.");
      return { error: "User not authenticated." };
    }
    if (!slug) {
      console.error("Error: Slug parameter is missing.");
      return { error: "Restaurant identifier (slug) is missing." };
    }

    console.log(`Fetching restaurant for user: ${userId}, slug: ${slug}`);
    const { data: restaurantData, error: errorRestaurantID } = await supabase
      .from("restaurants")
      .select("*") // Only select the ID
      .eq("user_id", userId)
      .eq("slug", slug)
      .single(); // Use single to expect one row

    if (errorRestaurantID) {
      console.error("Supabase error fetching restaurant:", errorRestaurantID);
      return {
        error: `Database error finding restaurant: ${errorRestaurantID.message}`,
      };
    }
    if (!restaurantData) {
      console.error(`Restaurant not found for user ${userId} and slug ${slug}`);
      return { error: "Restaurant not found or access denied." };
    }
    const restaurantID = restaurantData.id; // Extract the ID
    console.log(`Found restaurant ID: ${restaurantID}`);

    // --- Upsert Category ---
    // Try to find existing category first, or insert if not found
    console.log(
      `Upserting category: ${newItem.category} for restaurant: ${restaurantID}`
    );
    const { data: categoryData, error: categoryError } = await supabase
      .from("category")
      .insert({ name: newItem.category, restaurant_id: restaurantID }) // Define conflict target
      .select("id") // Select the ID after upsert
      .single(); // Expect one row back

    if (categoryError) {
      console.error("Supabase error upserting category:", categoryError);
      return {
        error: `Database error managing category: ${categoryError.message}`,
      };
    }
    if (!categoryData) {
      console.error(
        `Failed to upsert or retrieve category: ${newItem.category}`
      );
      return { error: "Failed to process category." };
    }
    const categoryId = categoryData.id; // Extract the ID
    console.log(`Using category ID: ${categoryId}`);

    // uploading image_plate:

    const imageResponse = await imageUpload(
      newItem.image_plate,
      restaurantData.name,
      newItem.name
    );

    // --- Insert Menu Item ---
    console.log(`Inserting menu item: ${newItem.name}`);
    const { data: menuItemData, error: menuItemError } = await supabase
      .from("menu_items") // Your table name
      .insert([
        {
          // Ensure these field names match your ItemInfo and table columns
          name: newItem.name,
          description: newItem.description,
          options: newItem.option, // Assumes 'options' column is text[] or jsonb
          price: newItem.price,
          category_id: categoryId, // *** CHANGED: Use correct foreign key name if different ***
          // objects: newItem.objects, // Add if you have an 'objects' field in ItemInfo
          calories: newItem.calories,
          preparation_time: newItem.preparation_time,
          restaurant_id: restaurantID, // *** ADDED: Link menu item to restaurant ***
          image_plate: imageResponse?.imageURL?.publicUrl, // Handle image URL if needed
        },
      ])
      .select("uid") // *** Select the 'uid' column ***
      .single(); // Expect one row back

    if (menuItemError) {
      console.error("Supabase insert menu item error:", menuItemError);
      return {
        error: `Database error creating menu item: ${menuItemError.message}`,
      };
    }
    // *** CHANGED: Check for menuItemData and menuItemData.uid ***
    if (!menuItemData?.uid) {
      console.error(
        "Failed to create menu item or retrieve UID. Data:",
        menuItemData
      );
      return { error: "Failed to create menu item or retrieve UID." };
    }

    const menuItemUid = menuItemData.uid;
    console.log("Menu Item Created in Supabase with UID:", menuItemUid);
    // *** Return data.uid ***
    // The client-side variable can still be called createdItemId, but it holds the UID value
    return { data: { id: menuItemUid } }; // Keep 'id' key consistent for client if preferred, but value is UID
  } catch (error: any) {
    // Catch unexpected errors (e.g., from auth(), network issues)
    console.error("Unexpected error in AddMenuItem:", error);
    // Check if it's a Supabase error object with a message
    const message = error.message || "An unexpected error occurred.";
    return { error: message };
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
