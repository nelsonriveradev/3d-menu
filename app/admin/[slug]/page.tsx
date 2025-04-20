"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import MenuItemCard from "@/app/components/MenuItemCard";
import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";

export default function RestaurantAdmin() {
  const { slug } = useParams();
  const [menuItems, setMenuItems] = useState<any[]>([]);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) {
        console.error("Error fetching data:", error);
      } else {
        console.log("Items:", data);
      }
      const { data: items, error: errorItems } = await supabase
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", data.id);
      if (errorItems) {
        console.log("Error items", errorItems);
      }
      return { items, error };
    };
    fetchData().then(({ items }) => {
      if (items) {
        setMenuItems(items);
      }
    });
  }, []);

  // fetch items
  console.log("Items:", menuItems);
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
          <MenuItemCard
            name="Plato 1"
            price={12}
            imagePlate="https://picsum.photos/100"
          />
          <MenuItemCard
            name="Plato 1"
            price={12}
            imagePlate="https://picsum.photos/100"
          />
          <MenuItemCard
            name="Plato 1"
            price={12}
            imagePlate="https://picsum.photos/100"
          />
          <MenuItemCard
            name="Plato 1"
            price={12}
            imagePlate="https://picsum.photos/100"
          />
        </div>
      </div>
    </div>
  );
}
