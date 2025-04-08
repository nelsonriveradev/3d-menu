import { ItemInfo } from "./page";
import { toast } from "sonner";

export default async function AddMenuItem(newItem: ItemInfo) {
  try {
    console.log("Submitted to Supabase", newItem);
    toast.success("Plato añadido correctamente!");
  } catch (error) {
    console.log(error);
    toast.error("Uppss, hubo un error al añadir plato");
  }
}
