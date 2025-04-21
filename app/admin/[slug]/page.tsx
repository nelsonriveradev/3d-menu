"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import MenuItemCard from "@/app/components/MenuItemCard";
import { useEffect, useState } from "react";
// import { useUser, useAuth } from "@clerk/nextjs"; // Clerk not used here currently
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner"; // Assuming you use sonner for notifications
import { supabase } from "@/lib/supabase/supabaseClient";

// Helper function to extract storage path from public URL
function getPathFromUrl(
  url: string | null | undefined,
  bucketName: string
): string | null {
  if (!url) return null;
  try {
    const urlObject = new URL(url);
    // Example URL: https://<project-ref>.supabase.co/storage/v1/object/public/<bucket-name>/<path/to/file.jpg>
    // Need to extract the part after the bucket name
    const pathPrefix = `/storage/v1/object/public/${bucketName}/`;
    if (urlObject.pathname.startsWith(pathPrefix)) {
      return decodeURIComponent(
        urlObject.pathname.substring(pathPrefix.length)
      );
    }
  } catch (e) {
    console.error("Error parsing URL:", e);
  }
  // Fallback or if URL format is different - adjust if necessary
  console.warn("Could not extract path from URL:", url);
  return null;
}
export default function RestaurantAdmin() {
  const { slug } = useParams();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null); // Store restaurant ID

  useEffect(() => {
    const fetchData = async () => {
      // Fetch restaurant first to get its ID
      const { data: restaurantData, error: restaurantError } = await supabase
        .from("restaurants")
        .select("id") // Only need the ID
        .eq("slug", slug)
        .single();

      if (restaurantError || !restaurantData) {
        console.error("Error fetching restaurant data:", restaurantError);
        toast.error("Could not load restaurant information.");
        return { items: null }; // Return null items if restaurant fetch fails
      }

      const currentRestaurantId = restaurantData.id;
      setRestaurantId(currentRestaurantId); // Store the ID in state

      // Fetch menu items for this restaurant
      const { data: items, error: errorItems } = await supabase
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", currentRestaurantId); // Use the fetched ID

      if (errorItems) {
        console.error("Error fetching menu items:", errorItems);
        toast.error("Could not load menu items.");
      }
      return { items }; // Return only items
    };

    fetchData().then(({ items }) => {
      if (items) {
        setMenuItems(items);
      }
    });
  }, [slug, supabase]); // Add supabase to dependency array

  //delete item function
  async function deleteHandle(itemId: string) {
    // Ensure the item exists in the current state
    const itemToDelete = menuItems.find((item) => item.uid === itemId);

    if (!itemToDelete) {
      toast.error("Item not found.");
      console.error("Attempted to delete an item not found in state:", itemId);
      return;
    }

    // --- Delete Plate Image ---
    const plateImagePath = getPathFromUrl(itemToDelete.image_plate, "plates");
    if (plateImagePath) {
      console.log(`Attempting to delete image: plates/${plateImagePath}`);
      const { error: imageDeleteError } = await supabase.storage
        .from("plates")
        .remove([plateImagePath]);
      if (imageDeleteError) {
        console.error("Error deleting image:", imageDeleteError.message);
        toast.error(`Failed to delete image: ${imageDeleteError.message}`);
        return; // Stop further execution if image deletion fails
      } else {
        console.log("Image deleted successfully.");
      }
    } else {
      console.log("No valid image path found to delete.");
    }
    // Find the item details in the current state
    if (!itemToDelete) {
      toast.error("Item not found.");
      console.error("Attempted to delete an item not found in state:", itemId);
      return;
    }

    // --- 1. Delete Storage Items ---
    let imageDeleted = false;
    let objectsDeleted = false;

    // Delete Plate Image
    const imagePath = getPathFromUrl(itemToDelete.image_plate, "plates");
    if (imagePath) {
      console.log(`Attempting to delete image: plates/${imagePath}`);
      const { error: imageDeleteError } = await supabase.storage
        .from("plates")
        .remove([imagePath]);
      if (imageDeleteError) {
        console.error(
          "*---------- Error deleting image:",
          imageDeleteError.message
        );
        toast.error(`Failed to delete image: ${imageDeleteError.message}`);
        // Decide if you want to proceed if image deletion fails
      } else {
        console.log("Image deleted successfully.");
        imageDeleted = true;
      }
    } else {
      console.log("No valid image path found to delete.");
      imageDeleted = true; // Treat as success if no path
    }

    // Delete 3D Objects Folder/Files
    // Construct the folder path - **ADJUST THIS** based on your actual upload structure
    // Common structures: restaurantSlug/itemId/ or restaurantSlug/itemName/
    // Using itemId is generally safer than name. Assuming 'slug/itemId/' structure.
    const objectFolderPath = `${slug}/${itemId}/`;
    console.log(
      `Attempting to list/delete objects in folder: 3d-objects/${objectFolderPath}`
    );

    const { data: filesInFolder, error: listError } = await supabase.storage
      .from("3d-objects") // Your 3D objects bucket
      .list(objectFolderPath);

    if (listError) {
      console.error("*---------- Error listing 3D objects:", listError.message);
      toast.error(`Failed to list 3D objects: ${listError.message}`);
      // Decide if you want to proceed
    } else if (filesInFolder && filesInFolder.length > 0) {
      const filePathsToRemove = filesInFolder.map(
        (file) => `${objectFolderPath}${file.name}`
      );
      console.log("Attempting to delete 3D files:", filePathsToRemove);
      const { error: objectsDeleteError } = await supabase.storage
        .from("3d-objects")
        .remove(filePathsToRemove);

      if (objectsDeleteError) {
        console.error(
          "*---------- Error deleting 3D objects:",
          objectsDeleteError.message
        );
        toast.error(
          `Failed to delete 3D objects: ${objectsDeleteError.message}`
        );
        // Decide if you want to proceed
      } else {
        console.log("3D objects deleted successfully.");
        objectsDeleted = true;
      }
    } else {
      console.log("No 3D objects found in the folder to delete.");
      objectsDeleted = true; // Treat as success if no files
    }

    // --- 2. Delete Database Row (Only if storage deletion was successful or acceptable) ---
    // You might want to adjust this logic based on whether partial success is okay
    if (imageDeleted && objectsDeleted) {
      // Example: proceed only if both succeeded
      console.log(`Attempting to delete database row for item ID: ${itemId}`);
      const { error: dbDeleteError } = await supabase
        .from("menu_items")
        .delete()
        .eq("uid", itemId); // Use the unique ID

      if (dbDeleteError) {
        console.error(
          "*---------- Error deleting database row:",
          dbDeleteError.message
        );
        toast.error(
          `Failed to delete item from database: ${dbDeleteError.message}`
        );
      } else {
        console.log(`Database row deleted successfully for item ID: ${itemId}`);
        toast.success(`${itemToDelete.name} deleted successfully!`);

        // --- 3. Update UI State ---
        setMenuItems((prevItems) =>
          prevItems.filter((item) => item.id !== itemId)
        );
      }
    } else {
      toast.warning(
        "Item deletion incomplete due to storage errors. Database row not deleted."
      );
    }
  }
  //delete item

  return (
    <div className="">
      <div className="flex flex-col">
        <h1 className="text-3xl self-center">Aqui puedes manejar tus platos</h1>
        <div className=" flex justify-center items-center gap-x-2 mt-1">
          <Link
            className="text-zinc-100 bg-zinc-700 py-2 px-4 rounded-xl shadow ease-in-out transition-all active:scale-110 hover:scale-110"
            href={`/admin/${slug}/editar-lista`}
          >
            Editar Lista
          </Link>
        </div>
        {/* Lista */}

        <div className="flex flex-col gap-y-2">
          {menuItems.map((item) => (
            <MenuItemCard
              key={item.uid}
              itemId={item.uid}
              name={item.name}
              price={item.price}
              imagePlate={item.image_plate}
              deleteItem={(event) => deleteHandle(item.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
