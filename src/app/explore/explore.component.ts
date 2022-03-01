import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HostListener } from '@angular/core';
import { WalletService } from '../wallet.service';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent implements OnInit {

  query: string;

  constructor(private activatedRoute: ActivatedRoute, private router: Router, public wallet:WalletService) { }

  ngOnInit(): void {
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) { 
    this.search(event);
  }

  search(e) {
    if (e.key === "Enter") {
      this.navigate();
    }
  }

  navigate() {
    if (this.query.substring(0, 2) === "0x") {
      this.router.navigate(["collection", this.query]);
    }
    else if (isNaN(parseInt(this.query))) {
      this.wallet.showToast("Invalid ID or Address.");
    }
    else {
      this.router.navigate(["view", parseInt(this.query)]);
    }
  }
}
