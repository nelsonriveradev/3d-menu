import Header from "./components/Header";
import Image from "next/image";
import ItemCard from "./components/ItemCard";
export default function Home() {
  return (
    <div>
      <header>
        <Header restaurantName="Restaurante Prueba" />
      </header>

      <form className=" mt-5 py-2 px-4 bg-zinc-300 rounded-lg flex justify-start items-center gap-x-5">
        <Image
          className=""
          src="/Icons/icons8-search-100.png"
          alt="search icon"
          width={16}
          height={16}
        />
        <input
          className="px-1 focus:outline-none focus:bg-zinc-300"
          type="text"
          placeholder="¿Que te antojas?"
        />
      </form>

      <div className="mt-7">
        <h1 className="text-xl">Te recomendamos</h1>
        <div className="">
          <ItemCard />
        </div>
      </div>
    </div>
  );
}
