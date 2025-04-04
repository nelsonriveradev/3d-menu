import Link from "next/link";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="">
      <div className="flex flex-col">
        <h1 className="text-3xl self-center">Aqui puedes manejar tus platos</h1>
        <div className=" flex justify-center items-center gap-x-2 mt-1">
          <Link
            className="text-zinc-100 bg-zinc-700 py-2 px-4 rounded-xl shadow ease-in-out transition-all active:scale-110 hover:scale-110"
            href="/admin/ingresar-plato"
          >
            Ingresar Platos
          </Link>
          <Link
            className="text-zinc-100 bg-zinc-700 py-2 px-4 rounded-xl shadow ease-in-out transition-all active:scale-110 hover:scale-110"
            href="/admin/editar-lista"
          >
            Editar Lista
          </Link>
        </div>
      </div>
      <div className="">{children}</div>
    </div>
  );
}
