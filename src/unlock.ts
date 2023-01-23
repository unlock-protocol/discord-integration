import { Web3Service } from "@unlock-protocol/unlock-js";
import { config } from "./config";
import { networks } from "@unlock-protocol/networks";

export const web3Service = new Web3Service(networks);

export async function hasMembership(userAddress: string) {
  for (const [lockAddress, { network }] of Object.entries<{ network: number }>(
    config.paywallConfig.locks
  )) {
    const keyId = await web3Service.getTokenIdForOwner(
      lockAddress,
      userAddress,
      network
    );
    if (keyId > 0) {
      return true;
    }
  }
  return false;
}
