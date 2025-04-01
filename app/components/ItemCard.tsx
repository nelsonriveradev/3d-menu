import Image from "next/image";
import Link from "next/link";

export default function ItemCard({
  name,
  description,
  price,

  image_plate,
}: {
  name: string;
  description: string;
  price: number;

  image_plate: string;
}) {
  return (
    <div className="bg-zinc-500  text-zinc-100 p-4 flex flex-col justify-center items-center rounded-xl">
      <Image
        className="rounded-lg"
        src={image_plate}
        alt={`${name} photo`}
        width={350}
        height={350}
      />
      <div className="flex justify-between items-center w-full mt-3">
        <div className="flex w-full justify-between items-center">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold ">{name}</h1>
            <p className="text-xs">{description}</p>
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
        <h1 className="text-lg font-bold">{`$${price}`}</h1>
        <Link
          href={`/${name}`}
          prefetch={true}
          className="cursor-pointer py-1.5 px-2 bg-zinc-800 text-zinc-100 rounded-lg text-xs transition-all ease-in-out duration-100 hover:transform hover:scale-110 active:scale-110 "
        >
          Ver más
        </Link>
      </div>
    </div>
  );
}
