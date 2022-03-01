import { Component, OnInit } from '@angular/core';
import { ConstantsService } from '../constants.service';
import { WalletService } from '../wallet.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  constructor(public wallet:WalletService, constants: ConstantsService) {
   }

  ngOnInit(): void {
  }
  
  zkScan() {
    if (this.wallet.networkID === 1) {
      return "https://zkscan.io/";
    }
    else if (this.wallet.networkID === 4) {
      return "https://rinkeby.zkscan.io/";
    }
  }

}
