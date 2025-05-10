import { ColumnDef } from "@tanstack/react-table";
import { MenuItem } from "@/types";

export const columns: ColumnDef<MenuItem>[] = [
  {
    accessorKey: "name",
    header: "Nombre del Plato",
  },
  {
    accessorKey: "price",
    header: "Precio",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      return `$${price.toFixed(2)}`;
    },
  },
  {
    accessorKey: "category",
    header: "Categoria",
  },
  {
    accessorKey: "createdAt",
    header: "Fecha",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return date.toLocaleDateString();
    },
  },
];
