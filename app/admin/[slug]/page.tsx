"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import MenuItemCard from "@/app/components/MenuItemCard";
import { useEffect, useState } from "react";
// import { useUser, useAuth } from "@clerk/nextjs"; // Clerk not used here currently
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner"; // Assuming you use sonner for notifications
import { supabase } from "@/lib/supabase/supabaseClient";
import Image from "next/image";

// Helper function to extract storage path from public URL
function getPathFromUrl(
  url: string | null | undefined,
  bucketName: string,
  restaurantName: string
): string | null {
  if (!url) return null;
  try {
    const urlObject = new URL(url);
    // Example URL: https://<project-ref>.supabase.co/storage/v1/object/public/<bucket-name>/<path/to/file.jpg>
    // Need to extract the part after the bucket name
    const pathPrefix = `/storage/v1/object/public/${bucketName}/${restaurantName}`;
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
  const [restaurant, setRestaurant] = useState<{
    id: string;
    name: string;
  } | null>(null); // Store restaurant details

  useEffect(() => {
    const fetchData = async () => {
      // Fetch restaurant first to get its ID
      const { data: restaurantData, error: restaurantError } = await supabase
        .from("restaurants")
        .select("*") // Only need the ID
        .eq("slug", slug)
        .single();

      if (restaurantError || !restaurantData) {
        console.error("Error fetching restaurant data:", restaurantError);
        toast.error("Could not load restaurant information.");
        return { items: null }; // Return null items if restaurant fetch fails
      }

      const currentRestaurantId = restaurantData.id;
      setRestaurant(currentRestaurantId); // Store the ID in state

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
  async function deleteItemHandle(itemUid: string) {
    //fetch item by its id
    const { data: itemToDelete, error: errorItem } = await supabase
      .from("menu_items")
      .select()
      .eq("uid", itemUid)
      .single();
    if (errorItem || !itemToDelete) {
      toast.error("Error en econtrar articulo en la base de datos");
      console.error("Error in finding item in database: ", errorItem);
    }

    // Need to the path by
    const imageURL = itemToDelete.image_plate;
    const BUCKETNAME = "plates";
    let imagePath: string | null = null;

    // parse the path from the url
    if (imageURL) {
      try {
        const urlObject = new URL(imageURL);
        const pathPrefix = `/storage/v1/object/public/${BUCKETNAME}/`;
        if (urlObject.pathname.startsWith(pathPrefix)) {
          imagePath = decodeURIComponent(
            urlObject.pathname.substring(pathPrefix.length)
          );
          console.log(`Parsed image path: ${imagePath}`);
        } else {
          console.warn(
            "Could not extract path from URL, format mismatch:",
            imageURL
          );
          toast.error("No se pudo localizar imagen");
        }
      } catch (error) {
        console.error("*________________Error parsing image URL: ", error);
      }
    } else {
      console.log("No image URL associated with this item.");
      const { error: deleteError } = await supabase
        .from("menu_items")
        .delete()
        .eq("uid", itemUid);
      if (deleteError) {
        console.error("Error deleting plate", deleteError);
      }
    }
    let imageDeleteSuccess = !imageURL || !imagePath;

    if (imagePath) {
      console.log(
        `Attempting to delete image from bucket '${BUCKETNAME}' with path: ${imagePath}`
      );
      const { error: errorImagePlateDelete } = await supabase.storage
        .from(`${BUCKETNAME}`)
        .remove([imagePath]);
      if (errorImagePlateDelete) {
        toast.error(
          `no se pudo borrar la imagen relacionada con el plato: ${itemToDelete.name}`
        );
        console.error(
          "Error deleting image from storage:",
          errorImagePlateDelete
        );
        imageDeleteSuccess = false;
      } else {
        console.log("Image deleted successfully from storage.");
        toast.success("Imagen borrada con exito!");
        imageDeleteSuccess = true;
      }
      if (imageDeleteSuccess) {
        console.log(
          `Attempting to delete database row for item UID: ${itemUid}`
        );
        const { error: dbDeleteError } = await supabase
          .from("menu_items")
          .delete()
          .eq("uid", itemUid);

        if (dbDeleteError) {
          console.error("Error deleting database row:", dbDeleteError);
          toast.error("Error en borrar plato.");
        } else {
          console.log("Database row deleted successfully.");
          toast.success("El plato fue borrado con éxito");
          // Update UI state
          setMenuItems((prevItems) =>
            prevItems.filter((item) => item.uid !== itemUid)
          );
        }
      }
    }
  }

  return (
    <div className="">
      <div className="flex flex-col">
        <h1 className="text-3xl self-center">Mis platos</h1>
        {/* <div className=" flex justify-center items-center gap-x-2 mt-1">
          <Link
            className="text-zinc-100 bg-zinc-700 py-2 px-4 rounded-xl shadow ease-in-out transition-all active:scale-110 hover:scale-110"
            href={`/admin/${slug}/editar-lista`}
          >
            Editar Lista
          </Link>
        </div> */}
        {/* Lista */}

        <div className="flex flex-col gap-y-2">
          {menuItems.length > 0 ? (
            menuItems.map((item) => (
              <MenuItemCard
                key={item.uid}
                itemId={item.uid}
                name={item.name}
                price={item.price}
                description={item.description}
                imagePlate={item.image_plate}
                calories={item.calories}
                time={item.preparation_time}
                options={item.options}
                deleteItem={() => deleteItemHandle(item.uid)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center gap-y-4">
              <p className="mt-5 text-lg text-center">
                No tienes platos registrado en tu restaurante.
              </p>
              <Image
                src="/illustrations/Step 4.png"
                alt="No plate created illustration"
                width={150}
                height={150}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
