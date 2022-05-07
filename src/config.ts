export const paywallConfig = {
  messageToSign: "Allow access to Unlock Discord Community",
  network: 1,
  pessimistic: true,
  locks: {
    "0x08B3Fba858BbDcD5Cb0914c265260911Bdbbd5b9": {
      name: "Unlock Community",
      network: 137,
    },
  },
  icon: "https://raw.githubusercontent.com/unlock-protocol/unlock/master/design/brand/1808-Unlock-Identity_Unlock-WordMark.svg",
  callToAction: {
    default: `Get an Unlock membership to access our Discord, blog comments and more! Use the claim button if you cannot pay for gas.`,
  },
};

export const config = {
  paywallConfig,
  clientId: process.env.DISCORD_CLIENT_ID!,
  clientSecret: process.env.DISCORD_CLIENT_SECRET!,
  host: process.env.HOST!,
  token: process.env.DISCORD_BOT_TOKEN!,
  databaseURL: process.env.DATABASE_URL!,
  guildId: process.env.DISCORD_GUILD_ID!,
  roleId: process.env.DISCORD_ROLE_ID!,
  channelId: process.env.DISCORD_CHANNEL_ID!,
};
