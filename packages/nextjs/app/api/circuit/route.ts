import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const publicFilePath = path.resolve(process.cwd(), "public", "circuits.json"); //this would be for production
    console.log({ publicFilePath });
    if (fs.existsSync(publicFilePath)) {
      const data = fs.readFileSync(publicFilePath, "utf8");
      return NextResponse.json(JSON.parse(data));
    }

    const fallbackFilePath = path.resolve(process.cwd(), "../circuits/target/circuits.json"); //this would be for development
    if (fs.existsSync(fallbackFilePath)) {
      const data = fs.readFileSync(fallbackFilePath, "utf8");
      const parsedData = JSON.parse(data);
      return NextResponse.json(parsedData);
    }
    return NextResponse.json({ message: "circuits not found" }, { status: 404 });
  } catch (error) {
    console.error("Error reading circuits data:", error);
    return NextResponse.json({ error: "Failed to fetch circuit data" }, { status: 500 });
  }
}
