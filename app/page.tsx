import Image from "next/image";
import Header from "./components/Header";

export default function Home() {
  return (
    <div>
      <header>
        <Header restaurantName="Restaurante Prueba" />
      </header>
    </div>
  );
}
