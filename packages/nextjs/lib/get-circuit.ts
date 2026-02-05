import fs from "fs";
import path from "path";

export async function getCircuitData() {
  try {
    const publicFilePath = path.join(process.cwd(), "public", "circuits.json"); //this would be for production
    console.log({ publicFilePath });
    if (fs.existsSync(publicFilePath)) {
      const data = fs.readFileSync(publicFilePath, "utf8");
      return JSON.parse(data);
    }

    const devPath = path.resolve(process.cwd(), "../circuits/target/circuits.json"); //this would be for development
    if (fs.existsSync(devPath)) {
      const data = fs.readFileSync(devPath, "utf8");
      return JSON.parse(data);
    }
    return false;
  } catch (error) {
    console.error("Error reading circuits data:", error);
    return false;
  }
}
