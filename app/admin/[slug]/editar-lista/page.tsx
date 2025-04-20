"use client";
import { useParams } from "next/navigation";
export default function EditarLista() {
  const { slug } = useParams();
  return <div className="">{`${slug} Lista de articulos`}</div>;
}
