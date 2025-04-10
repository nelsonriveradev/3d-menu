import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  const formData = await req.formData();
  const fileUSDZ = formData.get("objectUSDZ") as File;
}
