"use client";
import Link from "next/link";
import Card from "./components/Card";
import Image from "next/image";

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
              <h3 className="text-3xl font-semibold text-center">
                Better Menu resuelve todo esto problemas con fluidez
              </h3>
              <Image
                src={"/illustrations/idea.svg"}
                alt="girl in a computer"
                width={500}
                height={500}
              />
              <h3></h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. Features Overview
// Keep this clean, like Notion. Maybe a vertical stack or icon grid.

// Realtime updates

// AI-generated sections

// Upload your branding

// Customer analytics (if you're planning for later)

// 4. How It Works (Playful, Step-by-Step)
// Step 1: Create your menu

// Step 2: Add your items or let AI help

// Step 3: Share your custom QR

// Step 4: Update anytime — from your phone
