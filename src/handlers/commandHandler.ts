import { CommandInteraction, GuildMemberRoleManager } from "discord.js";
import unlockHandler from "./handleUnlock";

export async function unlockCommandHandler(interaction: CommandInteraction) {
  if (interaction.commandName === "ping") {
    interaction.reply({
      ephemeral: true,
      content: "Pong!",
    });
  } else if (interaction.commandName === "unlock") {
    try {
      unlockHandler(interaction);
    } catch (error) {
      console.error(error);
      interaction.reply({
        ephemeral: true,
        content:
          "It looks like the bot encountered an error while processing your request. Please try again!",
      });
    }
  } else {
    interaction.reply({
      ephemeral: true,
      content: "Please, type `/unlock`!",
    });
  }
}

export default unlockCommandHandler;
