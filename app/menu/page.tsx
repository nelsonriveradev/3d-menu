"use client";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CategoryList from "../components/CategoryList";
import Image from "next/image";
import ItemCard from "../components/ItemCard";
import { createClient } from "@/utils/supabase/client";
import { useState, useEffect } from "react";
import { ItemInfo } from "../admin/[slug]/ingresar-plato/page";
export default function Home() {
  const supabase = createClient();
  const [data, setData] = useState<ItemInfo[]>([]);

  console.log("Data:", data);

  useEffect(() => {
    const fetchData = async () => {
      const { data: menuItems, error } = await supabase
        .from("menu_items")
        .select("*")
        .range(0, 9);

      if (error) {
        console.error("Error fetching data:", error);
      } else {
        setData(menuItems);
      }
    };

    fetchData();
  }, [supabase]);
  return (
    <div>
      <header>
        <Header restaurantName="Restaurante Prueba" reviewLink="#" />
      </header>

      <form className=" mt-5 py-2 px-4 bg-zinc-300 rounded-lg flex justify-start items-center gap-x-5">
        <Image
          className=""
          src="/Icons/icons8-search-100.png"
          alt="search icon"
          width={16}
          height={16}
        />
        <input
          className="px-1 focus:outline-none focus:bg-zinc-300"
          type="text"
          placeholder="¿Que te antojas?"
        />
      </form>
      <div className="mt-5">
        <CategoryList />
      </div>

      <div className="mt-7">
        <h1 className="text-xl">Te recomendamos</h1>

        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          {data.map((item) => (
            <ItemCard
              key={item.name}
              name={item.name}
              description={item.description}
              price={item.price}
              image_plate={(item.image_plate as string) || ""}
            />
          ))}
        </div>
      </div>
      <footer className="mt-10">
        <Footer
          restaurantName="Restaurante Prueba"
          phoneNumber="787-123-4567"
          email="restaurante.prueba@email.com"
        />
      </footer>
    </div>
  );
}
