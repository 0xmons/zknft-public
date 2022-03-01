# zknft

[zkNFT](https://www.zknft.xyz) is a proof of concept NFT marketplace using the zkSync NFT API.

Steps to run locally:

1. Install all dependencies using `npm install`.
2. Fix issues in `node_modules` detailed [here](https://github.com/ChainSafe/web3.js/issues/1555) for `crypto` and `stream`.
3. Fill in the credentials in `credentials.service.ts` with your own API keys.

TODOs:

0. Debug the issue where `syncProvider.getNFT(id)` is failing server-side. (x)
1. Improve UI for components, potentially overhaul and add Angular UI component framework (e.g. Bootstrap).
2. Add the ability to offer/accept ETH for an NFT.
3. Better show the assets being offered after a trade offer is made. (x)
4. Rename `wallet` component to `portal` component to remove confusion.
