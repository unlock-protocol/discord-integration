const communityLockAddress = "0xb6bd8fc42df6153f79eea941a2b4c86f8e5f7b1d";
const primeLockAddress = "0x01d8412ee898a74ce44187f4877bf9303e3c16e5";
const network = 8453;

export const paywallConfig = {
  messageToSign: "Allow access to Unlock Discord Community",
  name: "Join the Unlock Community",
  pessimistic: true,
  network,
  locks: {
    [communityLockAddress]: {
      network,
    },
  },
  persistentCheckout: true,
  metadataInputs: [{ name: "email", type: "email", required: true }],
};

const communityRole = "687375227629338750";
const primeRole = "1295864797857976362";

const roleMapping = {
  [communityLockAddress]: communityRole,
  [primeLockAddress]: primeRole,
};

export const config = {
  paywallConfig,
  clientId: process.env.DISCORD_CLIENT_ID!,
  clientSecret: process.env.DISCORD_CLIENT_SECRET!,
  host: process.env.HOST!,
  token: process.env.DISCORD_BOT_TOKEN!,
  databaseURL: process.env.DATABASE_URL!,
  guildId: process.env.DISCORD_GUILD_ID!, // That is the server id (right click on server to get it!)
  channelId: process.env.DISCORD_CHANNEL_ID!, // Channel in which we listen to the commands
  roleMapping,
  primeRole,
  communityRole,
};
