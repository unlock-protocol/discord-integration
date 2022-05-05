export const paywallConfig = {
  messageToSign: "Allow access to Unlock Discord Community",
  network: 1,
  pessimistic: true,
  locks: {
    "0xB0114bbDCe17e0AF91b2Be32916a1e236cf6034F": {
      name: "Unlock Community",
      network: 1,
    },
    "0xac1fceC2e4064CCd83ac8C9B0c9B8d944AB0D246": {
      name: "Unlock Community",
      network: 100,
    },
  },
  icon: "https://raw.githubusercontent.com/unlock-protocol/unlock/master/design/brand/1808-Unlock-Identity_Unlock-WordMark.svg",
  callToAction: {
    default: `Get an Unlock membership to access our Discord, blog comments and more!
  
        If gas prices are high, pick the xDAI membership and receive an airdrop!`,
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
