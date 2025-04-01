import Image from "next/image";

export default function ItemCard(props: any) {
  return (
    <div className="bg-zinc-500  text-zinc-100 p-4 flex flex-col justify-center items-center rounded-xl">
      <Image
        className="rounded-lg"
        src="/photos/pizza_1.jpg"
        alt="pizza photo"
        width={350}
        height={350}
      />
      <div className="flex justify-between items-center w-full mt-3">
        <div className="flex w-full justify-between items-center">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold ">{props.name}</h1>
            <p className="text-xs">Descripcion del plato</p>
          </div>
          <Image
            src="/Icons/icons8-heart-not-filled-100.png"
            alt="heart like icon"
            width={16}
            height={16}
          />
        </div>
      </div>
      <div className="mt-10 flex justify-between md:justify-center md:gap-x-8 w-full">
        <h1 className="text-lg font-bold">$12</h1>
        <button className="cursor-pointer py-1.5 px-2 bg-zinc-800 text-zinc-100 rounded-lg text-xs transition-all ease-in-out duration-100 hover:transform hover:scale-110 active:scale-110 ">
          Ver más
        </button>
      </div>
    </div>
  );
}
