import Image from "next/image";
import Link from "next/link";
import DetailCards from "../components/DetailCards";
import { createClient } from "@/utils/supabase/client";
export default async function ItemDetails({
  params,
}: {
  params: Promise<{ itemName: string }>;
}) {
  const supabase = createClient();
  const itemName = decodeURIComponent((await params).itemName);

  const { data: menuItem, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("name", itemName)
    .single();
  if (error) {
    console.log(error);
  }
  console.log(menuItem);

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
            <button className="cursor-pointer flex gap-x-1 text-zinc-200 justify-center mx-auto bg-zinc-800 rounded-2xl py-2 px-4 transition-all ease-in-out hover:scale-110 ">
              Ver plato virtualmente{" "}
              <span className=" transition-all hover:ease-in-out ease-in-out duration-100 hover:animate-bounce hover:delay-75">
                <Image
                  src="/Icons/icons8-ar-white-64.png"
                  alt="Augmented Reality icon"
                  width={24}
                  height={24}
                />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
