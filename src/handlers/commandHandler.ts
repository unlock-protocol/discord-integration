import {
  CommandInteraction,
  GuildMemberRoleManager,
  MessageActionRow,
  MessageButton,
} from "discord.js";
import { Nounce, User } from "../database";
import { config } from "../config";
import { hasMembership } from "../unlock";

export async function unlockCommandHandler(interaction: CommandInteraction) {
  if (interaction.commandName === "ping") {
    return interaction.reply({
      ephemeral: true,
      content: "Pong!",
    });
  }
  if (interaction.commandName === "unlock") {
    await interaction.deferReply({
      ephemeral: true,
    });

    const user = await User.findOne({
      where: {
        id: interaction.member?.user.id,
      },
    });

    const showCheckout = async (interaction: CommandInteraction) => {
      const [nounce] = await Nounce.upsert({
        id: crypto.randomUUID(),
        userId: interaction.member!.user.id,
      });

      const nounceData = nounce.toJSON();

      const checkoutURL = new URL(`/checkout/${nounceData.id}`, config.host!);

      const row = new MessageActionRow().addComponents(
        new MessageButton()
          .setStyle("LINK")
          .setLabel("Claim Membership")
          .setURL(checkoutURL.toString())
          .setEmoji("🔑")
      );
      await interaction.editReply({
        content:
          "You need to go through the checkout and claim a membership NFT.",
        components: [row],
      });
    };

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
          const fetchedRole = await interaction.guild?.roles.fetch(
            config.roleId
          );
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
}

export default unlockCommandHandler;
