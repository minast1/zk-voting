import fs from "fs";
import path from "path";

export async function getCircuitData() {
  try {
    const publicFilePath = path.resolve(process.cwd(), "public", "circuits.json"); //this would be for production
    console.log({ publicFilePath });
    if (fs.existsSync(publicFilePath)) {
      const data = fs.readFileSync(publicFilePath, "utf8");
      return JSON.parse(data);
    }

    const fallbackFilePath = path.resolve(process.cwd(), "../circuits/target/circuits.json"); //this would be for development
    if (fs.existsSync(fallbackFilePath)) {
      const data = fs.readFileSync(fallbackFilePath, "utf8");
      return JSON.parse(data);
    }
    return false;
  } catch (error) {
    console.error("Error reading circuits data:", error);
    return false;
  }
}
