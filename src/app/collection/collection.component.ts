import { Component, OnInit } from '@angular/core';
import { WalletService } from '../wallet.service';
import { UtilsService } from "../utils.service";
import { ConstantsService } from "../constants.service";
import { NftDataService } from '../nftDataService';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.css']
})
export class CollectionComponent implements OnInit {

  nftList: any;
  address: any;
  blockiesOptions: any;
  noNFTs: boolean;

  constructor(private activatedRoute: ActivatedRoute, public wallet:WalletService, public utils: UtilsService, public constants: ConstantsService, public nftDataService: NftDataService) { 
    this.nftList = [];
  }

  ngOnInit(): void {
    this.address = this.activatedRoute.snapshot.paramMap.get('address');
    this.blockiesOptions = { // All options are optional
      seed: this.address, // seed used to generate icon data, default: random
      color: '#dfe', // to manually specify the icon color, default: random
      bgcolor: '#aaa', // choose a different background color, default: random
      size: 15, // width/height of the icon in blocks, default: 8
      scale: 3, // width/height of each block in pixels, default: 4
      spotcolor: '#fff' // each pixel has a 13% chance of being of a third color,
    }

    this.wallet.providerConnectedEvent.subscribe(() => {
      this.loadStaticData();
    });

    this.activatedRoute.params.subscribe(routeParams => {
      this.address = routeParams.address;
      if (this.wallet.providerConnected) {
        this.loadStaticData();
      }
    });
  }

  async loadStaticData() {
    this.nftList = [];
    const state = await this.wallet.syncProvider.getState(this.address);
    let nfts = await state.committed.nfts;
    for (let key in await nfts) {
      let data = await this.nftDataService.getData(key);
      this.nftList.push(data);
    }
    if (this.nftList.length === 0) {
      this.noNFTs = true;
    }
  }

}
