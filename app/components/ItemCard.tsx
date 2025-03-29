import Image from "next/image";

export default function ItemCard(props: any) {
  return (
    <div className="bg-zinc-500 flex flex-col justify-center items-center rounded-xl">
      <Image
        src="/photos/pizza_1.jpg"
        alt="pizza photo"
        width={100}
        height={100}
      />
      <h1>Card ItemCard</h1>
    </div>
  );
}
