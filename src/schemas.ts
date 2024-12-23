import { z } from "zod";

export const ConnectToMinecraftServerSchema = z.object({
    name: z.string()
})