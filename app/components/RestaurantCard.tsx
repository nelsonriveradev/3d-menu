import { Restaurant } from "@/types";
import Image from "next/image";
import Link from "next/link";

export default function RestaurantCard({
  restaurant,
}: {
  restaurant: Restaurant;
}) {
  return (
    <div className="border-2 border-zinc-600 rounded-2xl p-4 flex items-center justify-evenly gap-x-4 w-2/3">
      <Image
        className="rounded-lg"
        src={restaurant.logo_url}
        alt={`${restaurant.name} logo`}
        width={100}
        height={100}
      />
      <div className="flex flex-col">
        <h1 className="text-xl font-semibold">{restaurant.name}</h1>
        <p>{restaurant.location}</p>
      </div>
      <Link href={`admin/${restaurant.slug}`}>
        <Image
          className="rotate-180"
          src={`/Icons/icons8-back-64.png`}
          alt="arrow right"
          width={40}
          height={40}
        />
      </Link>
    </div>
  );
}
