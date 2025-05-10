"use client";
import Link from "next/link"; // Keep if needed for links
import { useParams } from "next/navigation";
import MenuItemCard from "@/app/components/MenuItemCard"; // Keep if used in UI
import { useState } from "react"; // Keep for basic UI state if needed
// Removed useEffect, useUser, useAuth, createClient, toast, supabase
import Image from "next/image"; // Keep for the placeholder image

// Removed helper function getPathFromUrl

export default function RestaurantAdmin() {
  const { slug } = useParams(); // Keep slug if needed for links or display
  const [menuItems, setMenuItems] = useState<any[]>([]); // Keep state, start empty

  // --- ALL FUNCTIONS REMOVED ---
  // - useEffect hook for fetching data
  // - deleteItemHandle function

  return (
    <div className="">
      <div className="flex flex-col">
        <h1 className="text-3xl self-center">Mis platos</h1>
        {/* Example Link (can be kept or removed) */}
        {/* <div className=" flex justify-center items-center gap-x-2 mt-1">
          <Link
            className="text-zinc-100 bg-zinc-700 py-2 px-4 rounded-xl shadow ease-in-out transition-all active:scale-110 hover:scale-110"
            href={`/admin/${slug}/editar-lista`} // Example usage of slug
          >
            Editar Lista
          </Link>
        </div> */}

        {/* Lista */}
        <div className="flex flex-col gap-y-2">
          {/* Conditional rendering based on the empty menuItems state */}
          {menuItems.length > 0 ? (
            menuItems.map((item) => (
              // This part won't render initially as menuItems is empty
              // You might replace this with placeholder/skeleton components later
              <MenuItemCard
                key={item.uid} // Assuming item structure if data were present
                itemId={item.uid}
                name={item.name}
                price={item.price}
                description={item.description}
                imagePlate={item.image_plate}
                calories={item.calories}
                time={item.preparation_time}
                options={item.options}
                deleteItem={() => {
                  /* Placeholder or remove */
                }} // Removed call to deleteItemHandle
              />
            ))
          ) : (
            // Displayed when menuItems is empty
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
