import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConstantsService {
  PRECISION = 1e18;
  MAP = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  IPFS_GATEWAY = "https://ipfs.io/ipfs/";

  ZKNETWORK = "mainnet";
  ZK_EXPLORER = "https://zkscan.io/explorer/transactions/";

  // ZKNETWORK = "rinkeby";
  // ZK_EXPLORER = "https://rinkeby.zkscan.io/explorer/transactions/";
  
  ETH_EXPLORER = "https://etherscan.io/tx/";
  ZK_WALLET = "https://wallet.zksync.io/";
}