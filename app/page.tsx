"use client";
import Link from "next/link";
import Card from "./components/Card";
import Image from "next/image";
import Footer from "./components/Footer";
export default function HomePage() {
  return (
    <div>
      <div className="flex flex-col">
        {/* hero */}
        <div className="flex flex-col gap-y-3">
          <h1 className="text-4xl font-bold text-center">
            Los menus merecen algo mejor
          </h1>
          <p className="px-2 text-center italic text-base/5">
            Better Menu ayuda a los restaurantes a dejar atras un menu monotono
            en pdf a diseñar un menu dynamic e interactivo que brindará una
            mejor experienciaa a los clientes que tu amas.
          </p>
          {/* CTA */}
          <div className="flex justify-center items-center">
            <Link
              href={"/"}
              className="bg-[var(--color-primary)]   text-center rounded-lg w-1/3 mx-auto px-2 py-1 shadow text-[var(--color-soft-black)]"
            >
              Comienza Gratis
            </Link>
            <Link
              href={"/"}
              className="bg-[var(--color-primary)]   text-center rounded-lg w-1/3 mx-auto px-2 py-1 shadow text-[var(--color-soft-black)]"
            >
              Miralo en acción
            </Link>
          </div>
          <Image
            className="place-self-center"
            src={"/illustrations/hero illustration_1.png"}
            alt="women using the phone "
            width={300}
            height={300}
          />
        </div>
        {/* problem to solve */}
        <div className="mt-10 ">
          <h3 className="text-2xl font-semibold text-center">
            El PDF ya pasó de moda
          </h3>
          {/* cards */}
          <div className="flex flex-col items-center gap-y-5">
            <Card
              illustration="/illustrations/design-planning-with-brush.svg"
              title="Statico y aburrido"
              info="Dificil de navegar, son lento en cargar y no fue diseñado para la mejor experiencia."
            />
            <Card
              illustration="/illustrations/time-management.svg"
              title="Se ve bien, pero es  antigüo"
              info="Todavia los menus tienen uns structura antigüa viendo una larga lista sin ninguna interacción."
            />
            <Card
              illustration="/illustrations/healthy-eating.svg"
              title="Experiencia limitada"
              info="No hay personalización, no hay filtros, no hay un flujo intuitivo. No solo se trata de como se ve, se trata de que funcione al cliente."
            />
            <div className="flex flex-col items-center mt-10">
              <h3 className="text-2xl font-semibold text-center">
                Better Menu resuelve todo esto problemas con fluidez
              </h3>
              <Image
                src={"/illustrations/idea.svg"}
                alt="girl in a computer"
                width={500}
                height={500}
              />
            </div>
          </div>
        </div>
        {/* como funciona */}
        <div className="flex flex-col items-center mt-10">
          <h1 className="text-4xl font-bold text-center">Como funciona?</h1>
          <div className="flex flex-col gap-y-4 items-center mt-7">
            <Card
              illustration="/illustrations/Step 1.png"
              title="1. Crea una cuenta"
              info="Puedes crearla con tu correo personal o con Google"
            />
            <Card
              illustration="/illustrations/Step 2.png"
              title="2. Añade tus platos"
              info="Organiza tu menú tal como quieres"
            />
            <Card
              illustration="/illustrations/Step 3.png"
              title="3. Comparte tu menú"
              info="Puedes crear un QR code o usar tu enlace para compartir tu menú"
            />
            <Card
              illustration="/illustrations/Step 4.png"
              title="4. Actualiza tu menú"
              info="Si hay cambios en tu restaurante puedes actualizarlo en cualquier momento desde tu celular o computadora."
            />
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
