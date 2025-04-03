import Link from "next/link";
export default function Header({
  restaurantName,
  reviewLink,
}: {
  restaurantName: string;
  reviewLink?: string;
}) {
  return (
    <div className="w-full flex justify-between items-center">
      <div className="flex  flex-col">
        <h3 className="text-zinc-600 text-xs">Bienvenidos a</h3>
        <Link href="/" className="font-bold text-lg">
          {restaurantName}
        </Link>
      </div>
      <div className="w-fit">
        <button className="p-2 bg-zinc-300 rounded-lg text-zinc-900 shadow-2xl text-xs font-medium">
          Dejanos tu review
        </button>
      </div>
    </div>
  );
}
