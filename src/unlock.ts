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

export async function hasMembership(userAddress: string) {
  for (const [lockAddress, { network }] of Object.entries<{ network: number }>(
    config.paywallConfig.locks
  )) {
    const provider = new ethers.providers.JsonRpcProvider(
      `https://rpc.unlock-protocol.com/${network}`
    );

    const lock = new ethers.Contract(lockAddress, ABI, provider);
    const hasValidKey = await lock.getHasValidKey(userAddress);
    return hasValidKey;
  }
}
