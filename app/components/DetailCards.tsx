import Image from "next/image";

export default function DetailCards({
  img,
  name,
  data,
  title,
}: {
  img: string;
  name: string;
  data: string;
  title: string;
}) {
  return (
    <div className="flex flex-col items-center gap-y-0.5 text-zinc-200 bg-zinc-800 p-2 rounded-xl min-w-15 max-w-16">
      <Image
        src={img}
        alt={`${name} icon for details`}
        width={30}
        height={30}
      />
      <div className="flex flex-col justify-center items-center">
        <p className="text-sm">{data}</p>
        <p className="text-sm">{title}</p>
      </div>
    </div>
  );
}
