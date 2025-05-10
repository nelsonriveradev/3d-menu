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
    }
    getRestaurant();
  }, [isLoaded, user, getToken]);
  return (
    <div>
      {isLoaded ? (
        <>
          <p className="text-xl font-semibold text-center mb-5">
            {user?.emailAddresses[0]?.emailAddress}
          </p>
          {restaurants?.map((rest: Restaurant) => (
            <RestaurantCard restaurant={rest} key={rest.slug} />
          ))}
        </>
      ) : (
        <div className="flex flex-col gap-y-5">
          <Skeleton className="w-[200px] h-[25px] bg-zinc-200" />
          <div className="flex">
            <Skeleton className="w-[300px] h-[100px] bg-zinc-200" />
          </div>
        </div>
      )}
    </div>
  );
}
