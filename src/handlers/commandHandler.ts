import { CommandInteraction, GuildMemberRoleManager } from "discord.js";
import unlockHandler from "./handleUnlock";

export async function unlockCommandHandler(interaction: CommandInteraction) {
  if (interaction.commandName === "ping") {
    return interaction.reply({
      ephemeral: true,
      content: "Pong!",
    });
  } else if (interaction.commandName === "unlock") {
    return unlockHandler(interaction);
  } else {
    return interaction.reply({
      ephemeral: true,
      content: "Please, type `/unlock`!",
    });
  }
}

export default unlockCommandHandler;
