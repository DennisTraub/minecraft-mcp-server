import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema, 
    ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

import { MinecraftServer } from "./minecraftServer.js";
import { 
    ConnectToMinecraftServerSchema, 
    DisconnectFromMinecraftServerSchema, 
    SendChatMessageSchema 
} from "./schemas.js";


const minecraftServer = new MinecraftServer();

const mcpServer = new Server(
    { name: "minecraft-server", version: "0.0.1-alpha1" }, 
    { capabilities: { tools: {} } }
);

mcpServer.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: "connect",
            description: `
                Connect to the minecraft server. 
                If the user didn't specify a name, use 'Claude'`,
            inputSchema: zodToJsonSchema(ConnectToMinecraftServerSchema)
        },
        {
            name: "disconnect",
            description: `
                Disconnect from the minecraft server.
                If the user didn't specify a message, choose an appropriate one yourself.`,
            inputSchema: zodToJsonSchema(DisconnectFromMinecraftServerSchema)
        },
        {
            name: "chat",
            description: `
                Send a chat message to the minecraft server`,
            inputSchema: zodToJsonSchema(SendChatMessageSchema)
        }
    ]
}));

mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        if (!request.params.arguments) {
            throw new Error("Arguments are required");
        }

        switch (request.params.name) {
            case "connect":
                const name = ConnectToMinecraftServerSchema.parse(request.params.arguments).name;
                return await minecraftServer.connect(name);

            case "disconnect":
                const message = DisconnectFromMinecraftServerSchema.parse(request.params.arguments).message;
                return await minecraftServer.disconnect(message);

            case "chat":
                const chatMessage = SendChatMessageSchema.parse(request.params.arguments).message;
                return await minecraftServer.chat(chatMessage);

            default:
                throw new Error(`Unknown tool: ${request.params.name}`);
        }

    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new Error(
                `Invalid arguments: ${error.errors
                    .map((e: z.ZodError["errors"][number]) => `${e.path.join(".")}: ${e.message}`)
                    .join(", ")}`
            );
        }
        throw error;
    }
});

async function runServer() {
    const transport = new StdioServerTransport();
    await mcpServer.connect(transport);
}

runServer().catch((error) => {
    console.error("Fatal error running server:", error);
    process.exit(1);
});