import { ButtonInteraction } from "discord.js";
import unlockHandler from "./handleUnlock";

async function unlockInteractionHandler(interaction: ButtonInteraction) {
  return unlockHandler(interaction);
}

export default unlockInteractionHandler;
