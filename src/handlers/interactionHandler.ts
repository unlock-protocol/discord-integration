import { ButtonInteraction, GuildMemberRoleManager } from "discord.js";
import { User } from "../database";
import { config } from "../config";
import { hasMembership } from "../unlock";
import showCheckout from "../showCheckout";

async function unlockInteractionHandler(interaction: ButtonInteraction) {
  await interaction.deferReply({
    ephemeral: true,
  });

  const user = await User.findOne({
    where: {
      id: interaction.member?.user.id,
    },
  });

  if (!user) {
    await showCheckout(interaction);
    return;
  }

  const { walletAddresses } = user?.toJSON();

  for (const walletAddress of walletAddresses) {
    const validMembership = await hasMembership(walletAddress);

    if (validMembership) {
      let role = interaction.guild?.roles.cache.get(config.roleId);

      if (!role) {
        const fetchedRole = await interaction.guild?.roles.fetch(config.roleId);
        role = fetchedRole!;
      }

      await (interaction.member!.roles as GuildMemberRoleManager).add(role);

      await interaction.editReply({
        content: `You already have a valid Unlock Membership. Welcome to Unlock Community, ${
          interaction.member!.user
        }. You can start sending messages now. Head over to <#1052336574211305574> and tell us a little more about yourself.`,
      });
      return;
    }
  }

  // If the user exists but does not have a valid membership
  await showCheckout(interaction);
}

export default unlockInteractionHandler;
