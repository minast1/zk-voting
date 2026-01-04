import { isAddress } from "viem";
import * as z from "zod";

export const allowListSchema = (status: boolean) =>
  z.object({
    list: z.array(
      z.object({
        address: z
          .string()
          .min(1, { message: "EOA or ENS Address is required.." })
          .refine(addr => isAddress(addr), {
            message: "Address provided is invalid..Please Check",
          }),
        status: z.boolean().default(status),
      }),
    ),
  });

export type AllowListSchema = z.infer<typeof allowListSchema>;
