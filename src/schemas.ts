import { z } from "zod";

export const ConnectToMinecraftServerSchema = z.object({
    name: z.string()
})

export const DisconnectFromMinecraftServerSchema = z.object({
    message: z.string()
})

export const SendChatMessageSchema = z.object({
    message: z.string()
})