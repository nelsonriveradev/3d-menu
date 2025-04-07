"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NavBar({ homeHref }: { homeHref: string }) {
  const router = useRouter();
  return (
    <div className=" py-2 px-4 rounded-lg flex justify-between items-center gap-x-10 w-full   ">
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
          src="/Icons/icons8-home-60.png"
          alt="home btn illustration"
          width={30}
          height={30}
        />
      </Link>
      <Link href="#" prefetch={true} className="cursor-pointer">
        <Image
          src="/Icons/icons8-heart-100.png"
          alt="heart btn illustration"
          width={30}
          height={30}
        />
      </Link>
    </div>
  );
}
