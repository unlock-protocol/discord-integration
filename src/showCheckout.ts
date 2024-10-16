import {
  ButtonInteraction,
  CommandInteraction,
  MessageActionRow,
  MessageButton,
} from "discord.js";
import { Nounce } from "./database";
import { config } from "./config";

const showCheckout = async (
  interaction: CommandInteraction | ButtonInteraction
) => {
  const nounce = await Nounce.create({
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
    content: "You need to go through the checkout and claim a membership NFT.",
    components: [row],
  });
};

export default showCheckout;
