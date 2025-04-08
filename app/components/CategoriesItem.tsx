import Image from "next/image";

export default function CategoriesItem({
  img,
  name,
}: {
  img: string;
  name: string;
}) {
  return (
    <button className="bg-zinc-900 px-2 py-1 rounded-lg shadow transition-transform duration-100 ease-in-out hover:scale-110 active:scale-110">
      <Image src={img} alt={`${name} category icon`} width={26} height={26} />
    </button>
  );
}
