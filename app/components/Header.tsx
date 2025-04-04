import Link from "next/link";
import Image from "next/image";
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
      <div className="w-fit flex flex-col items-center gap-y-1">
        <Link
          href="/admin"
          prefetch={true}
          className="self-end ease-in-out transition-all active:scale-110"
        >
          <Image
            src="/Icons/icons8-configuration-100.png"
            alt="configuration gear Icon"
            width={30}
            height={30}
          />
        </Link>
        <button className="p-2 bg-zinc-300 rounded-lg text-zinc-900 shadow-2xl text-xs font-medium">
          Dejanos tu review
        </button>
      </div>
    </div>
  );
}
