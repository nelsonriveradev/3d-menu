import Image from "next/image";
import DetailCards from "../components/DetailCards";
export default async function ItemDetails({
  params,
}: {
  params: Promise<{ itemName: string }>;
}) {
  const { itemName } = await params;
  const description =
    "    Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi rerum blanditiis fuga animi velit ipsa minima ipsum, unde labore debitis repellat suscipit, modi vero quos eligendi consequuntur quis, hic ut!";
  return (
    <div className="h-[100wh]">
      <div className="flex relative justify-between items-center">
        <Image
          src="/Icons/icons8-back-64.png"
          alt="backward button icon"
          width={35}
          height={35}
        />
        <Image
          src="/Icons/icons8-hamburger-menu-60.png"
          alt="hamburger menu button icon"
          width={35}
          height={35}
        />
      </div>
      {/* details background*/}
      <div className="bg-zinc-600 relative top-20 mx-auto h-full w-full rounded-t-4xl px-6  border-2 border-red-700 min-h-[calc(100vh-80px)] mt-4">
        <Image
          className="mx-auto relative -top-18 rounded-3xl"
          src="/photos/pizza_1.jpg"
          alt="pizza photo"
          width={350}
          height={300}
        />
        <div className="flex flex-col -mt-5">
          <div className="flex justify-between">
            <h1 className="text-4xl font-bold text-zinc-200">Pizza</h1>
            <div className="flex items-center gap-x-4">
              <Image
                src="/Icons/icons8-heart-not-filled-100.png"
                alt="like heart icon"
                width={30}
                height={30}
              />
              <div className="flex gap-x-2 text-zinc-200 items-center bg-zinc-800 px-4 py-1 rounded-lg">
                <Image
                  src="/Icons/icons8-star-96.png"
                  alt="like heart icon"
                  width={30}
                  height={30}
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
                data="10"
                title="min"
              />
              <DetailCards
                img="/Icons/icons8-fire-100.png"
                name="Calorias"
                data="1005"
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
            <p>{description}</p>
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
