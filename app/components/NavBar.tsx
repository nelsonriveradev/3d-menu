import Image from "next/image";
import Link from "next/link";
Link;

export default function NavBar() {
  return (
    <div className=" py-2 px-4 rounded-lg flex justify-center items-center gap-x-10 w-72 bg-zinc-800/40 backdrop-blur-sm ">
      <Link href="#" prefetch={true} className="cursor-pointer">
        <Image
          src="/Icons/icons8-back-100.png"
          alt="back btn illustration"
          width={30}
          height={30}
        />
      </Link>
      <Link href="/" prefetch={true} className="cursor-pointer">
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
