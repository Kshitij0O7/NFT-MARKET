const { expect } = require("chai");
const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => ethers.utils.formatEther(num)

describe("NFTMarketPlace", ()=>{
    let deployer, addr1, addr2, nft, marketPlace;
    let feePercent = 1;
    let URI = "Hello There";
    beforeEach(async () => {
        const NFT = await ethers.getContractFactory("NFT");
        const MarketPlace = await ethers.getContractFactory("MarketPlace");

        [deployer,addr1,addr2] = await ethers.getSigners();
        nft = await NFT.deploy();
        marketPlace = await MarketPlace.deploy(feePercent);
    });
    describe("Deployment", () => {
        it("Should track name and symbol of the token", async ()=>{
            expect(await nft.name()).to.equal("KSHITIJ NFT");
            expect(await nft.symbol()).to.equal("KSM");
        });
        it("Should track feeAccount and feePercent of the MarketPlace", async () => {
            expect(await marketPlace.feeAccount()).to.equal(deployer.address);
            expect(await marketPlace.feePercent()).to.equal(feePercent);
        });
    });
    describe("Minting of NFT", () => {
        it("Should track each minted NFT", async () => {
            await nft.connect(addr1).mint(URI);
            expect(await nft.tokenCount()).to.equal(1);
            expect(await nft.balanceOf(addr1.address)).to.equal(1);
            expect(await nft.tokenURI(1)).to.equal(URI);

            await nft.connect(addr2).mint(URI);
            expect(await nft.tokenCount()).to.equal(2);
            expect(await nft.balanceOf(addr2.address)).to.equal(1);
            expect(await nft.tokenURI(2)).to.equal(URI);
        });
    });
    describe("making MarketPlace Items", () => {
        beforeEach("Minting a NFT", async () =>{
            await nft.connect(addr1).mint(URI);//addr1 mints a nft
            await nft.connect(addr1).setApprovalForAll(marketPlace.address, true);//addr1 approve marketplace to spend it
        });
        it("Should track newly created items, transfer NFT from seller to marketPlace and emit Offered event", async () => {
            await expect(marketPlace.connect(addr1).makeItem(nft.address, 1, toWei(1)))
                .to.emit(marketPlace, "Offered")
                .withArgs(
                    1,
                    nft.address,
                    1,
                    toWei(1),
                    addr1.address
                )
            // Owner of NFT should now be marketplace
            expect(await nft.ownerOf(1)).to.equal(marketPlace.address);
            //ItemCount should be one 
            expect(await marketPlace.itemCount()).to.equal(1);
            //Get item from item mappings and check thier each n every field
            const item = await marketPlace.items(1);
            expect(item.itemId).to.equal(1);
            expect(item.nft).to.equal(nft.address);
            expect(item.tokenId).to.equal(1);
            expect(item.price).to.equal(toWei(1));
            expect(item.sold).to.equal(false);
        });

        it("Should fail if price is set to zero", async () => {
            await expect(
                marketPlace.connect(addr1).makeItem(nft.address, 1, 0)
            ).to.be.revertedWith("Price must be greater than zero");
        });
    });
    describe("Purchasing MarketPlace items", () => {
        let price = 2;
        let fee = (feePercent/100)*price;
        let totalPriceInWei;
        beforeEach("Minting a NFT", async () => {
            await nft.connect(addr1).mint(URI);//addr1 mints a nft
            await nft.connect(addr1).setApprovalForAll(marketPlace.address, true);//addr1 approve marketplace to spend it
            await marketPlace.connect(addr1).makeItem(nft.address, 1, toWei(price));//addr1 makes their nft a marketplace item
        });
        it("Should update item as sold, pay seller, charge fees, send nft to buyer and emit a bought event", async () => {
            const sellerInitialBalance = await addr1.getBalance();
            const feeAccountInitialBalance = await deployer.getBalance();
            totalPriceInWei = await marketPlace.getTotalPrice(1);

            await expect(marketPlace.connect(addr2).purchaseItem(1, { value: totalPriceInWei }))
                .to.emit(marketPlace, "Bought")
                .withArgs(
                    1,
                    nft.address,
                    1,
                    toWei(price),
                    addr1.address,
                    addr2.address
                );
            
            const sellerFinalBalance =  await addr1.getBalance();
            const feeAccountFinalBalance = await deployer.getBalance();

            expect(+fromWei(sellerFinalBalance)).to.equal(+price + +fromWei(sellerInitialBalance));// checks if seller account is updated correctly

            expect(+fromWei(feeAccountFinalBalance)).to.equal(+fee + +fromWei(feeAccountInitialBalance));

            expect(await nft.ownerOf(1)).to.equal(addr2.address);

            expect((await marketPlace.items(1)).sold).to.equal(true);
        });
        it("Should fail for invalid ids, sold out items and when not enough ether to pay", async () =>{
            // fails for invalid item ids
            await expect(
                marketPlace.connect(addr2).purchaseItem(2, {value: totalPriceInWei})
            ).to.be.revertedWith("Item doesn't exists");
            await expect(
                marketPlace.connect(addr2).purchaseItem(0, {value: totalPriceInWei})
            ).to.be.revertedWith("Item doesn't exists");
            // Fails when not enough ether is paid with the transaction. 
            // In this instance, fails when buyer only sends enough ether to cover the price of the nft
            // not the additional market fee.
            await expect(
                marketPlace.connect(addr2).purchaseItem(1, {value: toWei(price)})
            ).to.be.revertedWith("Not enough ether to cover for price and market fee"); 
            // addr2 purchases item 1
            await marketPlace.connect(addr2).purchaseItem(1, {value: totalPriceInWei})
            // addr3 tries purchasing item 1 after its been sold 
            await expect(
                marketPlace.connect(deployer).purchaseItem(1, {value: totalPriceInWei})
            ).to.be.revertedWith("Item has been sold out");
        });
    });
});