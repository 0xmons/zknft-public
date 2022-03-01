import { Component, OnInit } from '@angular/core';
import { WalletService } from '../wallet.service';
import { UtilsService } from "../utils.service";
import { ConstantsService } from "../constants.service";
import { CredentialsService } from '../credentials.service';
import { DomSanitizer} from '@angular/platform-browser';
import { NFTStorage } from 'nft.storage';
import { FormBuilder, Validators } from '@angular/forms';
import BigNumber from 'bignumber.js';
const pinataSDK = require('@pinata/sdk');
import autosize from 'autosize';

@Component({
  selector: 'app-mint',
  templateUrl: './mint.component.html',
  styleUrls: ['./mint.component.css']
})
export class MintComponent implements OnInit {

  mintFee: BigNumber;

  pinata: any;
  nftStorageClient: NFTStorage;

  name: any;
  description: any;
  image: any;
  imageURL: any;
  notUpload: boolean;
  externalURL: any;
  recipientAddress: any;

  isLoading1: any;
  loadingMessage1: any;
  isLoading2: any;
  loadingMessage2: any;

  attributes = this.fb.array([]);

  constructor(public wallet:WalletService, public utils: UtilsService, public constants: ConstantsService, public credentials: CredentialsService, private sanitizer: DomSanitizer, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.imageURL = "../assets/placeholder.svg";
    this.pinata = pinataSDK(this.credentials.PINATA_KEY, this.credentials.PINATA_SECRET);
    this.nftStorageClient = new NFTStorage({token: this.credentials.NFTSTORAGE_KEY});
    this.isLoading1 = false;
    this.isLoading2 = false;

    // Auto-resize the textarea
    autosize(document.querySelector('textarea'));

    this.mintFee = new BigNumber(0);

    this.wallet.providerConnectedEvent.subscribe(() => {
      this.getMintFee();
    });
  }

  addAttribute() {
    const newAttribute = this.fb.group({
      trait_type: ['', Validators.required],
      value: ['', Validators.required]
    });
    this.attributes.push(newAttribute);
  }

  deleteAttribute(i) {
    this.attributes.removeAt(i);
  }

  async mintNFT() {

    if (! this.wallet.syncWallet) {
      alert("Must sign in with wallet first to mint!");
      return;
    }

    this.getMintFee();
    this.isLoading2 = true;

    this.loadingMessage2 = "Uploading NFT data...";

    // Parse through attributes
    let attributesList = [];
    for (let i = 0; i < this.attributes.length; i++) {
      let item = (this.attributes.at(i) as any).controls;
      let a = {};
      a["trait_type"] = item.trait_type.value;
      a["value"] = item.value.value;
      attributesList.push(a);
    }
    const body = {
      "name": this.name,
      "image": this.image,
      "description": this.description,
      "external_url": this.externalURL,
      "attributes": attributesList
    }
    let results = await this.pinata.pinJSONToIPFS(body);
    let ipfsHash = results["IpfsHash"];

    let contentHash = this.utils.buf2hex(this.utils.fromB58(ipfsHash, this.constants.MAP)).substring(4,);
    this.loadingMessage2 = "Minting NFT..."
    let mintTx = await this.wallet.syncWallet.mintNFT({
      recipient: this.wallet.userAddress,
      contentHash: "0x" + contentHash,
      feeToken: "ETH"
    });

    let mintReceipt;
    try {
      mintReceipt = await mintTx.awaitReceipt();
    }
    catch(error) {
      this.wallet.showToast(`
      Your transaction failed, possibly because your balance is too low, or you haven't activated your account yet!`);
      this.isLoading2 = false;
      return;
    }

    this.wallet.showToast(`
    Your transaction was submitted! Track it <a href="${this.wallet.zkExplorer() + mintTx.txHash.substring(8,)}" target="_blank">here</a>.
    `);
    this.isLoading2 = false;
  }

  async uploadImage(files) {
    this.isLoading1 = true;
    this.loadingMessage1 = "Uploading image..."
    let file = files.item(0);
    let ipfasHash = await this.nftStorageClient.storeBlob(file);
    this.image = this.constants.IPFS_GATEWAY + ipfasHash;
    this.imageURL = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file));
    this.isLoading1 = false;
  }

  async getMintFee() {
    let txFeeData = await this.wallet.syncProvider.getTransactionFee("MintNFT", "0xdead169385a0d558f1009e73e8b81e9337a6cd85", 'ETH');
    let txFee = new BigNumber(parseInt(txFeeData.totalFee._hex)).div(this.constants.PRECISION);
    this.mintFee = txFee;
  }

}
