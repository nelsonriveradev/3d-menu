"use client";
import { useState, useEffect } from "react";

interface ItemInfo {
  name: string;
  description: string;
  option?: string[];
  price: number;
  category?: string;
  object?: string[];
  calories?: number;
  preparation_time?: string;
  image_plate?: string;
}
export default function Admin() {
  const [newMenuItem, setNewMenuItem] = useState<ItemInfo>();

  return (
    <div>
      <div className="">
        <h1>form</h1>
        <form className="bg-zinc-300  rounded-2xl py-2 px-4 flex flex-col justify-evenly gap-y-3">
          <div className="flex flex-col justify-center">
            <label className="font-semibold">Nombre del Plato</label>
            <input
              type="text"
              placeholder="Pasta en salsa de la casa"
              className="bg-zinc-500 text-zinc-100 rounded-lg px-2 py-1 w-2/3"
            />
          </div>
          <div className="flex flex-col justify-center">
            <label className="font-semibold">Descripción</label>
            <textarea
              placeholder="Pasta en salsa de la casa"
              className="bg-zinc-500 text-zinc-100 rounded-lg px-2 py-1 w-2/3"
            />
          </div>
          <div className="flex flex-col justify-center">
            <label className="font-semibold">opciones</label>
            <input
              placeholder="Pasta en salsa de la casa"
              className="bg-zinc-500 text-zinc-100 rounded-lg px-2 py-1 w-2/3"
            />
          </div>
          {/*  */}
          <div className="flex flex-col justify-center">
            <label className="font-semibold">Precio</label>
            <input
              placeholder="Pasta en salsa de la casa"
              className="bg-zinc-500 text-zinc-100 rounded-lg px-2 py-1 w-2/3"
            />
          </div>
          <div className="flex flex-col justify-center">
            <label className="font-semibold">Calorias</label>
            <input
              placeholder="Pasta en salsa de la casa"
              className="bg-zinc-500 text-zinc-100 rounded-lg px-2 py-1 w-2/3"
            />
          </div>
          <div className="flex flex-col justify-center">
            <label className="font-semibold">Tiempo de preparación</label>
            <input
              type="text"
              placeholder="Pasta en salsa de la casa"
              className="bg-zinc-500 text-zinc-100 rounded-lg px-2 py-1 w-2/3"
            />
          </div>
          <div className="flex flex-col justify-center">
            <label className="font-semibold">Objectos 3D</label>
            <input
              type="file"
              placeholder="Pasta en salsa de la casa"
              className="bg-zinc-500 text-zinc-100 rounded-lg px-2 py-1 w-2/3"
            />
          </div>
          <div className="flex flex-col justify-center">
            <label className="font-semibold">Imagen del Plato</label>
            <input
              type="file"
              placeholder="Pasta en salsa de la casa"
              className="bg-zinc-500 text-zinc-100 rounded-lg px-2 py-1 w-2/3"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
