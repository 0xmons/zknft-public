import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CredentialsService {
  PINATA_KEY = "22feff5f533e27dd256f";
  PINATA_SECRET = "a81c01737d85b1bc3a361577fea579168a8a9183ffdf92efb6d1dff250052691";
  BLOCKNATIVE_KEY = 'c094a276-3a28-4a57-a468-d61efa51e73c';
  INFURA_KEY = 'eb5ba991ba924ec5b80fd85423fd901f';
  TRADE_SERVER = 'https://zknft-server.herokuapp.com/';
  NFTSTORAGE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDU5YTE5MTAzZmQzNTM0ZTI3RUVhMTFiNjhDZEJFYjgxMTZEMUE0YWQiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYyNTY3ODAxNzU2NCwibmFtZSI6InprbmZ0In0.Vo7pGbd1ujscLl4GiWz_jFBa-Vm5QrfmdafVrR2WpPw';
}