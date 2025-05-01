"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

export default function NavBar({ homeHref }: { homeHref: string }) {
  const router = useRouter();
  const { slug } = useParams();
  const [isSlug, setIsSlug] = useState<boolean>();

  useEffect(() => {
    setIsSlug(slug === undefined || slug === null);
  }, [slug]);
  return (
    <div className=" py-2 px-10 rounded-lg flex justify-between items-center gap-x-5 w-full   ">
      <button onClick={() => router.back()} className="cursor-pointer">
        <Image
          src="/Icons/icons8-back-64.png"
          alt="back btn illustration"
          width={30}
          height={30}
        />
      </button>
      <Link href={`${homeHref}`} prefetch={true} className="cursor-pointer">
        <Image
          src="/Icons/icons8-restaurant-building-64.png"
          alt="home btn illustration"
          width={40}
          height={40}
        />
      </Link>
      <Link
        aria-disabled={isSlug}
        href={`/admin/${slug}/ingresar-plato`}
        prefetch={true}
        className={`cursor-pointer ${
          isSlug ? "opacity-50 pointer-events-none" : ""
        }`}
        onClick={(e) => {
          if (isSlug) {
            e.preventDefault();
          }
        }}
      >
        <Image
          src="/Icons/icons8-add-100.png"
          alt="add menu item icon"
          width={30}
          height={30}
        />
      </Link>
    </div>
  );
}
