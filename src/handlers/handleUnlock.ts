import {
  ButtonInteraction,
  CommandInteraction,
  GuildMemberRoleManager,
} from "discord.js";
import { User } from "../database";
import { config } from "../config";
import { rolesForUserAddress } from "../unlock";
import showCheckout from "../showCheckout";

export const unlockHandler = async (
  interaction: ButtonInteraction | CommandInteraction
) => {
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
    const roles = await rolesForUserAddress(walletAddress);

    // Adding the role(s) to the user
    for (const roleId of roles) {
      let role = interaction.guild?.roles.cache.get(roleId);
      if (!role) {
        const fetchedRole = await interaction.guild?.roles.fetch(roleId);
        role = fetchedRole!;
      }
      await (interaction.member!.roles as GuildMemberRoleManager).add(role);
    }

    // Prepare message based on the highest role
    if (roles.includes?.(config.primeRole)) {
      await interaction.editReply({
        content: `You have a valid Unlock Prime Membership. Thank you ${
          interaction.member!.user
        }. Head over to <#1296201410588839936> for Prime only conversations :)`,
      });
      return;
    } else if (roles.includes?.(config.communityRole))
      await interaction.editReply({
        content: `You have a valid Unlock Membership. Welcome to the Unlock Community, ${
          interaction.member!.user
        }. You can start sending messages now. Head over to <#1052336574211305574> and tell us a little more about yourself.`,
      });
    return;
  }

  // If the user exists but does not have a valid membership
  await showCheckout(interaction);
};

export default unlockHandler;
