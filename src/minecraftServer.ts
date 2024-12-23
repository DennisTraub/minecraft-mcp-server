import { 
    Bot, 
    createBot 
} from "mineflayer";

export type ConnectionResult =
    | { success: true; }
    | { success: false; error: string };

export class MinecraftServer {
    bot: Bot | undefined;
    
    async connect(name: string): Promise<ConnectionResult> {
        try {
            const bot: Bot = createBot({
                host: "localhost",
                port: 25565,
                username: name
            });
            this.bot = bot;
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: (error as Error).message 
            };
        }
    }
}
