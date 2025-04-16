import Link from "next/link";
export default function Footer() {
  return (
    <footer className="mt-20 bg-[var(--color-primary)] text-[var(--color-soft-black)] py-6 rounded-2xl">
      <div className="container mx-auto px-4 flex flex-col items-center gap-y-2 text-center">
        <h4 className="text-lg font-semibold">Better Menu</h4>
        <p className="text-sm italic">
          Revoluciona la forma en que compartes tu menú.
        </p>
        <div className="flex gap-x-4 mt-2">
          <Link href="/terms" className="text-sm hover:underline">
            Términos
          </Link>
          <Link href="/privacy" className="text-sm hover:underline">
            Privacidad
          </Link>
          <Link href="/contact" className="text-sm hover:underline">
            Contacto
          </Link>
        </div>
        <p className="text-xs mt-2">
          © {new Date().getFullYear()} Better Menu. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
}
