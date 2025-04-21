import Image from "next/image";

export default function MenuItemCard({
  name,
  imagePlate,
  price,
  itemId,
  deleteItem,
}: {
  name: string;
  imagePlate: string;
  price: number | string;
  itemId: string;
  deleteItem: (itemId: string) => void;
}) {
  // delete function

  return (
    <div className="flex px-4 py-2 bg-zinc-300 rounded-2xl items-center gap-x-3 shadow-md">
      <Image
        className="object-cover aspect-square rounded-lg"
        src={imagePlate}
        alt={`image of ${name}`}
        width={70}
        height={70}
      />
      <div className="flex text-zinc-700 w-1/2 gap-x-8 text-lg">
        <p>{name}</p>
        <p>{`$${price}`}</p>
      </div>
      <div className=" flex">
        {/* edit btn */}
        <button>
          <Image
            src={`/Icons/icons8-hamburger-menu-96.png`}
            alt="edit plate hamburger menu icon"
            width={25}
            height={25}
          />
        </button>
        {/* delete btn */}
        <button
          onClick={() => deleteItem(itemId)}
          className="transition-all duration-100 ease-in-out active:scale-110 hover:scale-105 hover:border-2 rounded-lg hover:p-2.5"
        >
          <Image
            src={`/Icons/icons8-delete-96.png`}
            alt="delete plate trash can icon"
            width={25}
            height={25}
          />
        </button>
      </div>
    </div>
  );
}
