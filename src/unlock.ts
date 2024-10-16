import { ethers } from "ethers";
import { config } from "./config";

const ABI = [
  {
    inputs: [{ internalType: "address", name: "_keyOwner", type: "address" }],
    name: "getHasValidKey",
    outputs: [{ internalType: "bool", name: "isValid", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
];

export async function rolesForUserAddress(userAddress: string) {
  const roles = [];
  for (const [lockAddress, roleId] of Object.entries(config.roleMapping)) {
    const provider = new ethers.providers.JsonRpcProvider(
      `https://rpc.unlock-protocol.com/${config.paywallConfig.network}`
    );

    const lock = new ethers.Contract(lockAddress, ABI, provider);
    const hasValidKey = await lock.getHasValidKey(userAddress);

    if (hasValidKey) {
      roles.push(roleId);
    }
  }
  return roles;
}
