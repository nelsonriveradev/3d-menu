import Link from "next/link";
export default function Footer(props: any) {
  return (
    <div className="grid grid-cols-2 py-2 gap-x-1">
      <div className="flex flex-col gap-y-2">
        <div className="flex flex-col">
          <h4 className="text-xs ">Diseñado por</h4>
          <h3 className="text-xl font-bold ">Nelson Rivera</h3>
        </div>
        <Link
          className="active:scale-110 text-lg font-medium bg-zinc-700 text-zinc-100 rounded-xl py-1 px-2 text-center "
          target="_blank"
          href="https://nelsonrivera.me/"
          prefetch={true}
        >
          Contactame 👨🏽‍💻
        </Link>
      </div>
      <div className="flex flex-col gap-y-2">
        <Link href="/" className="font-bold text-lg">
          {props.restaurantName}
        </Link>
        <div className="">
          <p>{props.phoneNumber}</p>
          <p className="text-sm">{props.email}</p>
        </div>
      </div>
    </div>
  );
}
