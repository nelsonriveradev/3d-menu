import Image from "next/image";

export default function NavBar() {
  return (
    <div className="bg-black py-2 px-4 rounded-lg flex justify-center items-center gap-x-10 w-72">
      <button className="cursor-pointer">
        <Image
          src="/Icons/icons8-back-100.png"
          alt="back btn illustration"
          width={30}
          height={30}
        />
      </button>
      <button className="cursor-pointer">
        <Image
          src="/Icons/icons8-home-60.png"
          alt="home btn illustration"
          width={30}
          height={30}
        />
      </button>
      <button className="cursor-pointer">
        <Image
          src="/Icons/icons8-heart-100.png"
          alt="heart btn illustration"
          width={30}
          height={30}
        />
      </button>
    </div>
  );
}
