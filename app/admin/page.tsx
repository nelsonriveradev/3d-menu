"use client";
import { useUser, useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import RestaurantCard from "../components/RestaurantCard";
import { createClient } from "@supabase/supabase-js";
import { Restaurant } from "@/types";

export default function Admin() {
  const [restaurants, setRestaurants] = useState<Restaurant[] | null>([]);
  const { isLoaded, user } = useUser();
  const { getToken } = useAuth();
  useEffect(() => {
    if (!user) {
      return;
    }

    async function getRestaurant() {
      const token = await getToken();
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: { Authorization: `Bearer ${token}` },
          },
        }
      );
      const { data: RestaurantList, error } = await supabase
        .from("restaurants")
        .select();

      setRestaurants(RestaurantList);
    }
    getRestaurant();
  }, [isLoaded, user, getToken]);
  console.log(restaurants);
  return (
    <div>
      <h1>Admin Page</h1>
      {isLoaded ? (
        <>
          <p>{user?.emailAddresses[0]?.emailAddress}</p>
          {restaurants?.map((rest: Restaurant) => (
            <RestaurantCard restaurant={rest} key={rest.slug} />
          ))}
        </>
      ) : (
        <div className="flex">
          <Skeleton className="w-[200px] h-[25px] bg-zinc-200" />
        </div>
      )}
    </div>
  );
}
