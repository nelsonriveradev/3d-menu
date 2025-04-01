import Header from "./components/Header";
import Footer from "./components/Footer";
import CategoryList from "./components/CategoryList";
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
      <div className="mt-5">
        <CategoryList />
      </div>

      <div className="mt-7">
        <h1 className="text-xl">Te recomendamos</h1>
        <div className="grid grid-cols-2 gap-x-4 gap-y-4">
          <ItemCard name="Pizza" />
          <ItemCard name="Pizza" />
          <ItemCard name="Pizza" />
          <ItemCard name="Pizza" />
        </div>
      </div>
      <footer className="mt-10">
        <Footer />
      </footer>
    </div>
  );
}
