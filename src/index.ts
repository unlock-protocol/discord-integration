import Fastify from "fastify";
import DiscordOauth from "discord-oauth2";
import { config } from "./config";
import cookie from "@fastify/cookie";
import { Client, Role } from "discord.js";
import { sequelize, Nounce, appendWalletAddress } from "./database";
import { hasMembership } from "./unlock";
import { ethers } from "ethers";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { commands } from "./commands";
import unlockInteractionHandler from "./handlers/interactionHandler";
import unlockCommandHandler from "./handlers/commandHandler";

const port = process.env.PORT || 8080;

interface GetStatusFromSignatureOptions {
  signature: string;
  userId: string;
}

const fetchStatusFromSignature = async ({
  signature,
  userId,
}: GetStatusFromSignatureOptions) => {
  try {
    const walletAddress = ethers.utils.verifyMessage(
      config.paywallConfig.messageToSign,
      signature
    );
    const status = await hasMembership(walletAddress);
    await appendWalletAddress(userId, walletAddress);
    return {
      status,
      walletAddress,
    };
  } catch {
    return {
      status: false,
      walletAddress: null,
    };
  }
};

const client = new Client({
  intents: ["GUILD_MEMBERS"],
});

const oauth = new DiscordOauth({
  clientId: config.clientId,
  clientSecret: config.clientSecret,
});

const restClient = new REST({
  version: "9",
}).setToken(config.token);

const fastify = Fastify({
  logger: true,
});

fastify.addHook("onClose", async (_, done) => {
  await sequelize.close();
  await client.destroy();
});

fastify.register(cookie, {
  parseOptions: {},
});

fastify.get<{
  Params: {
    nounce: string;
  };
}>("/checkout/:nounce", async (request, response) => {
  const checkoutURL = new URL("/checkout", "https://app.unlock-protocol.com");
  checkoutURL.searchParams.set(
    "paywallConfig",
    JSON.stringify(config.paywallConfig)
  );

  if (request.params.nounce) {
    checkoutURL.searchParams.set(
      "redirectUri",
      new URL(`/access/${request.params.nounce}`, config.host!).toString()
    );
  } else {
    checkoutURL.searchParams.set(
      "redirectUri",
      new URL("/membership", config.host!).toString()
    );
  }
  return response.redirect(checkoutURL.toString());
});

fastify.get<{
  Params: {
    nounce: string;
  };
  Querystring: {
    signature: string;
  };
}>("/access/:nounce", async (request, response) => {
  const nounce = await Nounce.findOne({
    where: {
      id: request.params.nounce,
    },
  });

  if (!nounce) {
    return response.status(404).send({
      message:
        "We could not find a valid request for the specified nounce. Please go through the bot again to regenerate a new one.",
    });
  }

  const { userId } = nounce.toJSON();

  const { status } = await fetchStatusFromSignature({
    signature: request.query.signature,
    userId: userId!,
  });

  if (!status) {
    return response.redirect(new URL("/membership", config.host!).toString());
  }

  const { guildId, roleId } = config;
  const guild = await client.guilds.fetch(guildId);
  const member = await guild.members.fetch(userId!);
  const role = await guild.roles.fetch(roleId);
  await member.roles.add(role as Role);

  const channel = await guild.channels.fetch(config.channelId);

  if (channel?.type === "GUILD_TEXT") {
    await channel.send({
      content: `Welcome to the Unlock Community, ${member.user}. You can start sending messages now. Head over to <#1052336574211305574> and tell us a little more about yourself.`,
    });
  }

  response.redirect(`https://discord.com/channels/${guildId}`);
  await nounce.destroy();
  return;
});

fastify.get<{
  Querystring: {
    signature: string;
  };
}>("/membership", async (req, res) => {
  const { signature } = req.query;
  if (!signature) {
    return res.status(401).send({
      message: "You need signature in the query params",
    });
  }
  const { paywallConfig } = config;
  const walletAddress = ethers.utils.verifyMessage(
    paywallConfig.messageToSign,
    signature
  );
  const hasValidMembership = await hasMembership(walletAddress);

  if (hasValidMembership) {
    const discordOauthURL = oauth.generateAuthUrl({
      redirectUri: new URL(`/access`, config.host).toString(),
      scope: ["guilds", "guilds.join", "identify"],
    });

    return res.redirect(discordOauthURL.toString());
  } else {
    return res.redirect(new URL(`/checkout`, config.host!).toString());
  }
});

fastify.get<{
  Querystring: {
    code: string;
  };
}>("/access", async (req, res) => {
  try {
    const code = req.query.code;
    const { guildId, roleId } = config;
    const data = await oauth.tokenRequest({
      code,
      grantType: "authorization_code",
      scope: ["guilds", "guilds.join", "identify"],
      redirectUri: new URL(`/access`, config.host).toString(),
    });

    const user = await oauth.getUser(data.access_token);
    const userGuilds = await oauth.getUserGuilds(data.access_token);
    const userGuildIds = userGuilds.map((guild) => guild.id);
    const guild = await client.guilds.fetch(guildId);
    if (userGuildIds.includes(guildId!)) {
      const member = await guild.members.fetch(user.id);
      const role = await guild.roles.fetch(roleId!);
      await member.roles.add(role!);
    } else {
      await oauth.addMember({
        userId: user.id,
        guildId,
        roles: [roleId],
        botToken: config.token!,
        accessToken: data.access_token,
      });
    }
    const channel = await guild.channels.fetch(config.channelId);

    if (channel?.type === "GUILD_TEXT") {
      await channel.send({
        content: `Welcome to the Unlock Community, ${user}. You can start sending messages now. Head over to <#1052336574211305574> and tell us a little more about yourself.`,
      });
    }
    return res.redirect(`https://discord.com/channels/${guildId}`);
  } catch (error) {
    // @ts-expect-error
    fastify.log.error(error.message);
    return res.status(500).send({
      message:
        "There was an error in accessing Unlock Discord. Please contact one of the team members.",
    });
  }
});

fastify.addHook("onReady", async () => {
  try {
    await sequelize.sync();
    await client.login(config.token);

    await restClient.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      {
        body: commands,
      }
    );

    client.on("ready", () => {
      fastify.log.info(`Discord bot connected!`);
    });

    client.on("guildMemberAdd", async (member) => {
      if (member.guild.id !== config.guildId) {
        return;
      }

      let channel = member.guild.channels.cache.get(config.channelId);
      if (!channel) {
        const fetchedChannel = await member.guild.channels.fetch(
          config.channelId
        );
        channel = fetchedChannel!;
      }

      if (channel.type !== "GUILD_TEXT") {
        return;
      }

      /* const row = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId("unlock")
          .setLabel("Unlock Discord")
          .setStyle("PRIMARY")
          .setEmoji("🔐")
      ); */
      await channel.send({
        content: `Hello ${member.user}! To join, type the \`/unlock\` command (don't forget the \`/\`) and press return.`,
        // components: [row],
      });
    });

    client.on("interactionCreate", async (interaction) => {
      if (interaction.isButton()) {
        if (interaction.customId === "unlock") {
          return unlockInteractionHandler(interaction);
        }
      }
      if (interaction.isCommand()) {
        return unlockCommandHandler(interaction);
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      fastify.log.error(error.message);
    }
    process.exit(1);
  }
});

fastify.listen(port, "0.0.0.0", async (error, address) => {
  if (error) {
    fastify.log.error(error.message);
    process.exit(0);
  }
  fastify.log.info(address);
});
