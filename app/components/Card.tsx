import Image from "next/image";

export default function Card({
  title,
  info,
  illustration,
}: {
  title: string;
  info: string;
  illustration: string;
}) {
  return (
    <div className="flex flex-col items-center px-4 w-2/3 ">
      <Image src={illustration} alt="Illustration" width={150} height={150} />
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-center">{info}</p>
    </div>
  );
}
