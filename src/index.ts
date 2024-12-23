import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema, 
    ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";

import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import { ConnectToMinecraftServerSchema } from "./schemas.js";
import { ConnectionResult, MinecraftServer } from "./minecraftServer.js";


const minecraftServer = new MinecraftServer();

const server = new Server(
    {
        name: "minecraft-server",
        version: "0.0.1-alpha-1"
    },
    { 
        capabilities: { tools: {} } 
    }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: "connect",
            description: "Connect to the minecraft server",
            inputSchema: zodToJsonSchema(ConnectToMinecraftServerSchema)
        }
    ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        if (!request.params.arguments) {
            throw new Error("Arguments are required");
        }

        switch (request.params.name) {
            case "connect":
                const args = ConnectToMinecraftServerSchema.parse(request.params.arguments);
                const name = args.name;
                const result: ConnectionResult = await minecraftServer.connect(name);
                return result;
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
    await server.connect(transport);
}

runServer().catch((error) => {
    console.error("Fatal error running server:", error);
    process.exit(1);
});