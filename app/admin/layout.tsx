import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";
import NavBar from "../components/NavBar";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="">
      <div className=" px-4">
        <NavBar homeHref="/admin" />
      </div>
      <div className="">
        <Toaster
          theme="system"
          expand={true}
          closeButton
          richColors
          position="top-right"
        />
      </div>

      <div className="">{children}</div>
    </div>
  );
}
