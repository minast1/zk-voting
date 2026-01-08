import { bytesToHex } from "viem";

const uint8ArrayToHexString = (buffer: any): `0x${string}` => {
  const proofBytes = new Uint8Array(Object.values(buffer));
  const proofHex = bytesToHex(proofBytes);
  return proofHex as `0x${string}`;
  // const hex: string[] = [];
  // buffer.forEach(function (i) {
  //   let h = i.toString(16);
  //   if (h.length % 2) {
  //     h = "0" + h;
  //   }
  //   hex.push(h);
  // });
  // return `0x${hex.join("")}`;
};

export default uint8ArrayToHexString;
