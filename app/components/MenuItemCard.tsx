"use client";
import Image from "next/image";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useEffect } from "react";
import type { ItemInfo } from "../admin/[slug]/ingresar-plato/page";
import { toast } from "sonner";

export default function MenuItemCard({
  name,
  imagePlate,
  price,
  itemId,
  deleteItem,
  description,
  calories,
  time,
  options,
}: {
  name: string;
  imagePlate: string;
  price: number | string;
  itemId: string;
  deleteItem: (itemId: string) => void;
  description: string;
  calories: number;
  time: string;
  options: string[];
}) {
  const [editOptions, setEditOptions] = useState<string[]>([]);
  useEffect(() => {
    async function initializeOptions() {
      setEditOptions((prevOptions) => {
        const alreadyOption = prevOptions.includes();
      });
    }
  });

  function editOptionHandle(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const inputOption = event.currentTarget
      .previousElementSibling as HTMLInputElement;
    const option = inputOption.value.trim();

    setEditOptions((prevOptions) => {
      const alreadyOption = prevOptions.includes(option);
      if (!alreadyOption && option) {
        // Ensure option is not empty
        return [...prevOptions, option];
      } else if (alreadyOption) {
        toast.warning(`Opcion ya está en lista: ${option}`);
        return prevOptions;
      }
      return prevOptions; // Return current state if option is empty
    });

    inputOption.value = "";
  }

  //handle function to server side
  function handleEdit(event: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const editItem: ItemInfo = {
      name: formData.get("edit-name") as string,
      description: formData.get("edit-description") as string,
      price: formData.get("edit-price") as number | null,
    };
  }
  return (
    <div className="flex px-4 py-2 bg-zinc-300 rounded-2xl items-center gap-x-3 shadow-md">
      <Image
        className="object-cover aspect-square rounded-lg"
        src={imagePlate}
        alt={`image of ${name}`}
        width={70}
        height={70}
      />
      <div className="flex text-zinc-700 w-1/2 gap-x-8 text-lg">
        <p>{name}</p>
        <p>{`$${price}`}</p>
      </div>
      <div className=" flex">
        {/* edit btn */}
        <Popover>
          <PopoverTrigger asChild>
            <button>
              <Image
                src={`/Icons/icons8-hamburger-menu-96.png`}
                alt="edit plate hamburger menu icon"
                width={25}
                height={25}
              />
            </button>
          </PopoverTrigger>
          <PopoverContent className="bg-zinc-100 text-zinc-700 h-72 overflow-y-scroll w-96">
            <div className="grid gap-3">
              <div className="">
                <h1 className="font-semibold">{name}</h1>
                <p className="text-sm">Edita la información de tu plato.</p>
              </div>
              <form>
                <div className="grid gap-2">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label htmlFor="name">Nombre: </label>
                    <input
                      id="name"
                      name="edit-name"
                      defaultValue={name}
                      className="col-span-2 h-8 border-2 rounded-lg px-2"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label htmlFor="description">Descripción: </label>
                    <textarea
                      id="description"
                      name="edit-description"
                      defaultValue={description}
                      placeholder={`Describe tu plate o bebida.`}
                      className="col-span-2  border-2 rounded-lg px-2 h-24"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label htmlFor="options">opciones </label>
                    <div className="flex flex-col items-center">
                      <input
                        id="options"
                        name="edit-options"
                        placeholder={`extra salsa`}
                        className="col-span-2 h-8 border-2 rounded-lg px-2"
                      />
                      <button onClick={editOptionHandle}>Añadir opción</button>
                    </div>
                  </div>
                  <div className="">
                    {editOptions.map((option) => (
                      <div className="flex items-center gap-x-4 w-full overflow-x-scroll">
                        <p className="underline">{option}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label htmlFor="price">Precio: </label>
                    <input
                      id="price"
                      name="edit-price"
                      defaultValue={price}
                      className="col-span-2 h-8 border-2 rounded-lg px-2"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label htmlFor="calories">calorias: </label>
                    <input
                      id="calories"
                      name="edit-price"
                      placeholder={`400 cal`}
                      defaultValue={calories}
                      className="col-span-2 h-8 border-2 rounded-lg px-2"
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center gap-4">
                    <label htmlFor="preparationTime">
                      Tiempo de preparación:{" "}
                    </label>
                    <input
                      id="preparationTime"
                      name="edit-time"
                      placeholder={`800`}
                      defaultValue={time}
                      className="col-span-2 h-8 border-2 rounded-lg px-2"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Link
                      className="p-2 rounded-xl bg-zinc-700 text-zinc-100 transition-all ease-in-out active:scale-110 hover:scale-110"
                      href={`#`}
                    >
                      Actualizar Imagen
                    </Link>
                    <Link
                      className="p-2 rounded-xl bg-zinc-700 text-zinc-100 transition-all ease-in-out active:scale-110 hover:scale-110"
                      href={`#`}
                    >
                      Actualizar Archivos 3D
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </PopoverContent>
        </Popover>
        {/* delete btn */}
        <button
          onClick={() => deleteItem(itemId)}
          className="transition-all duration-100 ease-in-out active:scale-110 hover:scale-105 hover:border-2 rounded-lg hover:p-2.5"
        >
          <Image
            src={`/Icons/icons8-delete-96.png`}
            alt="delete plate trash can icon"
            width={25}
            height={25}
          />
        </button>
      </div>
    </div>
  );
}
