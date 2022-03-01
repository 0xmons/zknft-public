import { Component, OnInit } from '@angular/core';
import { WalletService } from '../wallet.service';
import { UtilsService } from "../utils.service";
import { ConstantsService } from "../constants.service";
import { Router, ActivatedRoute } from '@angular/router';
import { utils as zkUtils} from "zksync";
import { NftDataService } from '../nftDataService';
import { CredentialsService } from '../credentials.service';
import { BigNumber } from "bignumber.js";

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit {

  nftId: any;
  nft: any;
  isOwner: boolean;
  recipientAddress: any;
  hasExternalLink: boolean;
  hasAttributes: boolean;
  showTransfer: boolean;
  
  selectedNftId: any;
  ownedNftList: any;
  showOfferModal: boolean;
  showEthModal: boolean;
  l2EthBalance: BigNumber;
  offerEthAmount: any;

  nftSwapOffers: any;
  ethSwapOffers: any;

  orderPending: boolean;

  constructor(private activatedRoute: ActivatedRoute, private router: Router, public wallet: WalletService, public utils: UtilsService, public constants: ConstantsService, public nftDataService: NftDataService, public credentials: CredentialsService) {
    this.resetData();
   }

  ngOnInit(): void {
    this.nftId = this.activatedRoute.snapshot.paramMap.get('id');
    this.activatedRoute.params.subscribe(routeParams => {
      this.nftId = routeParams.id;
      if (this.wallet.syncConnected) {
        this.loadData();
      }
      if (this.wallet.providerConnected) {
        this.resetData();
        this.loadStaticData();
      }
    });
    this.wallet.providerConnectedEvent.subscribe(() => {
      this.resetData();
      this.loadStaticData();
    });
    this.wallet.syncConnectedEvent.subscribe(() => {
      this.loadData();
    });
  }

  resetData() {
    this.isOwner = false;
    this.nft = {
      "name": "...",
      "image": "../assets/placeholder.svg",
      "description": "..."
    };
    this.hasExternalLink = false;
    this.hasAttributes = false;
    this.showTransfer = false;
    this.ownedNftList = [];
    this.showOfferModal = false;
    this.showEthModal = false;
    this.nftSwapOffers = [];
    this.ethSwapOffers = [];
  }

  async loadData() {
    const state = await this.wallet.syncWallet.getAccountState(this.wallet.userAddress);
    if (this.nftId in state.verified.nfts) {
      this.isOwner = true;
    }
  }

  async loadStaticData() {
    this.nft = await this.nftDataService.getData(this.nftId);

    if (this.nft["external_url"] !== undefined) {
      this.hasExternalLink = true;
    }
    if (this.nft["attributes"] !== undefined) {
      this.hasAttributes = true;
    }

    // Load swap offers from server
    let tradeEndpoint = this.credentials.TRADE_SERVER + 'assets/' + this.nftId;
    let response = await fetch(tradeEndpoint, {
      method: 'GET'
    });
    let swapOffers = await response.json();

    // Get NFT data for each offer if applicable
    // Otherwise populate with blank object
    for (let o of swapOffers) {
      let id = parseInt(o.data.tokenSell);
      if (id !== 0) {
        o["assetData"] = await this.nftDataService.getData(id);
        o["nftId"] = id;
        if (o["assetData"]["external_url"] !== undefined) {
          this.hasExternalLink = true;
        }
        this.nftSwapOffers.push(o);
      }
      else {
        o["ethAmount"] = (new BigNumber(o.data.amount)).div(new BigNumber(10**18));
        this.ethSwapOffers.push(o);
      }
    }
  }

  async transfer() {
    let tx = await this.wallet.syncWallet.syncTransferNFT({
      to: this.recipientAddress,
      token: this.nft,
      feeToken: "ETH"
    });
    // note that tx is an array of two transactions so we just grab the second one for now
    this.wallet.showToast(`
    Your transaction was submitted! Track it <a href="${this.wallet.zkExplorer() + tx[1].txHash.substring(8,)}" target="_blank">here</a>.
    `);
  }

  async offerNft() {
    if (! this.orderPending) {
      this.orderPending = true;
      const order = await this.wallet.syncWallet.getOrder({
        tokenSell: parseInt(this.selectedNftId),
        tokenBuy: parseInt(this.nftId),
        amount: 1,
        ratio: zkUtils.tokenRatio({
            [parseInt(this.selectedNftId)]: 1,
            [parseInt(this.nftId)]: 1
        })
      });
      let tradeEndpoint = this.credentials.TRADE_SERVER + 'assets/' + this.nftId;
      fetch(tradeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify(order)
      });
      this.closeOfferModal();
      this.wallet.showToast('Your offer has been submitted!');
      this.orderPending = false;
    }
  }

  async openOfferModal() {
    this.showOfferModal = true;
    if (this.ownedNftList.length === 0) {
      const state = await this.wallet.syncWallet.getAccountState(this.wallet.userAddress);
      for (let key in state.committed.nfts) {
        let data = await this.nftDataService.getData(key);
        this.ownedNftList.push(data);
      }
    }
  }

  closeOfferModal() {
    this.showOfferModal = false;
  }

  async offerEth() {
    if (! this.orderPending) {
      this.orderPending = true;
      let tokenSet = this.wallet.syncProvider.tokenSet;
      const order = await this.wallet.syncWallet.getOrder({
        tokenSell: 'ETH',
        tokenBuy: parseInt(this.nftId),
        amount: tokenSet.parseToken('ETH', this.offerEthAmount),
        ratio: zkUtils.tokenRatio({
            ETH: this.offerEthAmount,
            [parseInt(this.nftId)]: 1
        })
      });
      let tradeEndpoint = this.credentials.TRADE_SERVER + 'assets/' + this.nftId;
      fetch(tradeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify(order)
      });
      this.closeEthModal();
      this.wallet.showToast('Your offer has been submitted!');
      this.orderPending = false;
    }
  }

  async openEthModal() {
    this.showEthModal = true;
    this.l2EthBalance = new BigNumber((await this.wallet.syncWallet.getBalance("ETH"))/this.constants.PRECISION);
  }

  closeEthModal() {
    this.showEthModal = false;
  }

  async acceptNft(order) {
    let order1 = order.data;
    let order2 = await this.wallet.syncWallet.getOrder({
      tokenSell: parseInt(this.nftId),
      tokenBuy: parseInt(order.data.tokenSell),
      amount: 1,
      ratio: zkUtils.tokenRatio({
          [parseInt(order.data.tokenSell)]: 1,
          [parseInt(this.nftId)]: 1
      })
    });
    const swap = await this.wallet.syncWallet.syncSwap({
      orders: [
        order1, order2
      ],
      feeToken: 'ETH'
    });
    this.wallet.showToast(`
    Your transaction was submitted! Track it <a href="${this.wallet.zkExplorer() + swap.txHash.substring(8,)}" target="_blank">here</a>.
    `);
    let deleteEndpoint = this.credentials.TRADE_SERVER + 'delete/' + this.nftId;
    fetch(deleteEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify({
        id: order.id
      })
    });
  }

  async acceptEth(order) {
    let order1 = order.data;
    let order2 = await this.wallet.syncWallet.getOrder({
      tokenSell: parseInt(this.nftId),
      tokenBuy: 'ETH',
      amount: 1,
      ratio: zkUtils.tokenRatio({
          ETH: order.ethAmount,
          [parseInt(this.nftId)]: 1
      })
    });
    const swap = await this.wallet.syncWallet.syncSwap({
      orders: [
        order1, order2
      ],
      feeToken: 'ETH'
    });
    this.wallet.showToast(`
    Your transaction was submitted! Track it <a href="${this.wallet.zkExplorer() + swap.txHash.substring(8,)}" target="_blank">here</a>.
    `);
    let deleteEndpoint = this.credentials.TRADE_SERVER + 'delete/' + this.nftId;
    fetch(deleteEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify({
        id: order.id
      })
    });
  }

  copy(s) {
    this.wallet.showToast("Copied!");
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value =  s;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  truncate(s) {
    return s.substring(0, 10) + "...";
  }

  toggleShowTransfer() {
    this.showTransfer = !this.showTransfer;
  }

  setSelectedNftId(id) {
    this.selectedNftId = id;
  }
}
