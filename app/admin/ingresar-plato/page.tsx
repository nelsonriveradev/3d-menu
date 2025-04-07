"use client";
import { useState, useEffect } from "react";
import AddMenuItem from "./action";

export interface ItemInfo {
  name: string;
  description: string;
  option?: string[];
  price: number;
  category?: string;
  object?: string[];
  calories?: number;
  servings?: number;
  preparation_time?: string;
  image_plate?: string;
}
export default function Admin() {
  const [newMenuItem, setNewMenuItem] = useState<ItemInfo>();
  const [options, setOptions] = useState<string[]>([]);

  function optionHandle(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const inputOption = event.currentTarget
      .previousElementSibling as HTMLInputElement;
    const option = inputOption.value.trim();
    setOptions((prevOptions) => [...prevOptions, option]);
    console.log("Options:", options);
  }
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newItem: ItemInfo = {
      name: formData.get("plateName") as string,
      description: formData.get("description") as string,
      option: options, // Use the options state for the options array
      price: parseFloat(formData.get("price") as string) || 0,
      calories: parseInt(formData.get("calories") as string) || 0,
      preparation_time: formData.get("time") as string,
      image_plate: formData.get("image_plate") as string, // Placeholder for file handling
      object: [], // Placeholder for 3D objects file handling
    };
    setNewMenuItem(newItem);
    console.log("Submitted from Client", newItem);
    return AddMenuItem(newItem);
  }

  return (
    <div>
      <div className="">
        <h1>form</h1>
        <form
          onSubmit={handleSubmit}
          className="bg-zinc-300  rounded-2xl py-2 px-4 flex flex-col justify-evenly gap-y-3"
        >
          <div className="flex flex-col justify-center">
            <label className="font-semibold">Nombre del Plato</label>
            <input
              name="plateName"
              type="text"
              placeholder="Pasta en salsa de la casa"
              className="bg-zinc-500 text-zinc-100 rounded-lg px-2 py-1 "
            />
          </div>
          <div className="flex flex-col justify-center">
            <label className="font-semibold">Descripción</label>
            <textarea
              name="description"
              placeholder="Pasta en salsa de la casa"
              className="bg-zinc-500 text-zinc-100 rounded-lg px-2 py-1 "
            />
          </div>
          <div className="flex flex-col justify-center w-full">
            <label className="font-semibold">opciones</label>
            <div className="flex w-full gap-x-5">
              <input
                name="options"
                placeholder="extra salsa"
                className="bg-zinc-500 text-zinc-100 rounded-lg px-2 py-1 "
              />
              <button
                onClick={optionHandle}
                className="text-zinc-100 bg-zinc-800 px-2 py-1 rounded-lg"
              >
                Añadir option
              </button>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <label className="font-semibold">Precio</label>
            <input
              name="price"
              placeholder="Pasta en salsa de la casa"
              className="bg-zinc-500 text-zinc-100 rounded-lg px-2 py-1 "
            />
          </div>
          <div className="flex justify-between">
            <div className="flex flex-col justify-center">
              <label className="font-semibold">Calorias</label>
              <input
                name="calories"
                placeholder="Pasta en salsa de la casa"
                className="bg-zinc-500 text-zinc-100 rounded-lg px-2 py-1 "
              />
            </div>
            <div className="flex flex-col justify-center">
              <label className="font-semibold">Tiempo de preparación</label>
              <input
                name="time"
                type="text"
                placeholder="Pasta en salsa de la casa"
                className="bg-zinc-500 text-zinc-100 rounded-lg px-2 py-1 "
              />
            </div>
          </div>
          {/* Files input */}
          <div className="flex justify-between gap-x-2">
            <div className="flex flex-col justify-center w-1/2">
              <label className="font-semibold">Objectos 3D</label>
              <input
                type="file"
                placeholder="Pasta en salsa de la casa"
                className="bg-zinc-500 text-zinc-100 rounded-lg px-2 py-1 "
              />
            </div>
            <div className="flex flex-col justify-center w-1/2">
              <label className="font-semibold">Imagen del Plato</label>
              <input
                type="file"
                placeholder="Pasta en salsa de la casa"
                className="bg-zinc-500 text-zinc-100 rounded-lg px-2 py-1 "
              />
            </div>
          </div>
          <button className="cursor-pointer">Añadir</button>
        </form>
      </div>
    </div>
  );
}
