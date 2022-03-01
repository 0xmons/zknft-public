import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './header/header.component';
import { MintComponent } from './mint/mint.component';
import { ViewComponent } from './view/view.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CollectionComponent } from './collection/collection.component';
import { HotToastModule } from '@ngneat/hot-toast';
import { ExploreComponent } from './explore/explore.component';
import { FooterComponent } from './footer/footer.component';
import {BlockiesModule} from 'angular-blockies';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HeaderComponent,
    MintComponent,
    ViewComponent,
    CollectionComponent,
    ExploreComponent,
    FooterComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HotToastModule.forRoot(),
    BlockiesModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
