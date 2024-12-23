import { 
    Bot, 
    createBot 
} from "mineflayer";
import { Result, resultFrom } from "./types.js";

export class MinecraftServer {
    bot: Bot | undefined;
    
    async connect(name: string): Promise<Result> {
        try {
            this.bot = createBot({
                host: "localhost",
                port: 25565,
                username: name
            });
            return { success: true };
        } catch (error) {
            return resultFrom(error as Error); 
        }
    }

    async disconnect(message: string): Promise<Result> {
        if (!this.bot) {
            return({ success: false, error: "Not connected to the Minecraft server" });
        }

        try {
            this.bot.chat(message);
            this.bot.quit();
            this.bot = undefined;
            return { success: true };
        } catch (error) {
            return resultFrom(error as Error);
        }
    }

    async chat(message: string): Promise<Result> {
        if (!this.bot) {
            return({ success: false, error: "Not connected to the Minecraft server" });
        }

        try {
            this.bot.chat(message);
            return { success: true };
        } catch (error) {
            return resultFrom(error as Error);
        }
    }
}
