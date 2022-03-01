import { Injectable } from '@angular/core';
import { WalletService } from './wallet.service';
import { UtilsService } from "./utils.service";
import { ConstantsService } from "./constants.service";

@Injectable({
  providedIn: 'root'
})
export class NftDataService {

  constructor(public wallet:WalletService, public utils:UtilsService, public constants:ConstantsService) {}

  keySuffix = "_key";

  getKey(id) {
    return id + this.keySuffix;
  }

  storeData(id, data) {
    let key = this.getKey(id);
    window[key] = data;
  }

  exists(id) {
    let key = this.getKey(id);
    return window[key] !== undefined;
  }

  async fetchWithTimeout(resource, options) {
    const { timeout = 8000 } = options;
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
  
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal  
    });
    clearTimeout(id);
  
    return response;
  }

  async getData(id) {

    // Assume we don't know anything about the NFT at first
    let baseNftData = {
      "name": "Name Unknown",
      "image": "https://ipfs.io/ipfs/QmShBq4Xiho4SZf3PxAPLpbYvfHC2MtkpwnhtjN7v8h8iE"
    };

    // Read from zksync + parse from IPFS
    let nft;
    try {
      nft = await this.wallet.syncProvider.getNFT(parseInt(id));
    }
    catch (error) {
      baseNftData["name"] = "Invalid NFT";
      return baseNftData;
    }
            
    // Grab info from the syncProvider
    baseNftData["id"] = nft.id;
    baseNftData["address"] = nft.address;
    baseNftData["creatorAddress"] = nft.creatorAddress;
    baseNftData["contentHash"] = nft.contentHash;

    // Grab info from IPFS
    let contentHash = "1220" + nft.contentHash.substring(2,);
    let ipfsHash = this.utils.toB58(this.utils.hex2huf(contentHash), this.constants.MAP);

    console.log(this.constants.IPFS_GATEWAY + ipfsHash);

    try {
      let dataResponse = await this.fetchWithTimeout(this.constants.IPFS_GATEWAY + ipfsHash, {timeout: 5000});
      if (dataResponse.ok) {
        let nftData = await dataResponse.json();
  
        // Parse as much information as possible
        for (let k in nftData) {
          if (nftData[k] !== "") {
            baseNftData[k] = nftData[k];
            // Add https to URL if missing
            if (k === "external_url") {
              let link = nftData[k];
              link = (link.indexOf('://') === -1) ? 'https://' + link : link;
              baseNftData[k] = link;
            }
          }
        }
      }
    }
    finally {
      return baseNftData;
    }
  }
}