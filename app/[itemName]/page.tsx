import Image from "next/image";
supabase;
import Link from "next/link";
import DetailCards from "../components/DetailCards";
import ARScene from "../components/ARScene";
import { supabase } from "../../lib/supabase/supabaseClient";
export default async function ItemDetails({
  params,
}: {
  params: Promise<{ itemName: string }>;
}) {
  const itemName = decodeURIComponent((await params).itemName);

  const { data: menuItem, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("name", itemName)
    .single();
  if (error) {
    console.log(error);
  }

  return (
    <div className="h-[100wh]">
      <div className="flex relative justify-between items-center">
        <Link href={`/`} prefetch={true}>
          <Image
            src="/Icons/icons8-back-64.png"
            alt="backward button icon"
            width={35}
            height={35}
          />
        </Link>
        <Image
          src="/Icons/icons8-hamburger-menu-60.png"
          alt="hamburger menu button icon"
          width={35}
          height={35}
        />
      </div>
      {/* details background*/}
      <div className="bg-zinc-600 relative top-20 mx-auto h-full w-full rounded-t-4xl px-6 min-h-[calc(100vh-80px)] mt-4">
        <Image
          className="mx-auto relative -top-18 rounded-3xl"
          src={menuItem.image_plate}
          alt={`${menuItem.name} photo`}
          width={350}
          height={300}
        />
        <div className="flex flex-col -mt-5">
          <div className="flex justify-between">
            <h1 className="text-4xl font-bold text-zinc-200">
              {menuItem.name}
            </h1>
            <div className="flex items-center gap-x-4">
              <Image
                src="/Icons/icons8-heart-not-filled-100.png"
                alt="like heart icon"
                width={30}
                height={30}
              />
              <div className="flex gap-x-2 text-zinc-200 items-center justify-center bg-zinc-800 px-4 py-1 rounded-lg">
                <Image
                  src="/Icons/icons8-star-96.png"
                  alt="like heart icon"
                  width={24}
                  height={24}
                />

                <p className="text-lg font-semibold">4.9</p>
              </div>
            </div>
          </div>
          {/* Detalles Cards */}
          <div className="mt-10 mx-auto">
            <div className=" flex  items-center gap-x-4">
              <DetailCards
                img="/Icons/icons8-clock-100.png"
                name="time"
                data={menuItem.preparation_time}
                title="min"
              />
              <DetailCards
                img="/Icons/icons8-fire-100.png"
                name="Calorias"
                data={menuItem.calories}
                title="cal"
              />
              <DetailCards
                img="/Icons/icons8-queue-100.png"
                name="servings"
                data="2"
                title="servings"
              />
            </div>
          </div>
          {/* Description */}
          <div className="text-zinc-200 mt-10">
            <h2 className="text-2xl">Descripción:</h2>
            <p>{menuItem.description}</p>
          </div>
          <div className="mt-10">
            {menuItem.objects === null || menuItem.objects === false ? (
              <p className="text-zinc-200">
                Producto con vista virtual no disponible
              </p>
            ) : (
              <ARScene
                iosSrc={menuItem.objects[1] || ""}
                alt={`${menuItem.name} 3D object`}
                src={menuItem.objects[0] || ""}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
