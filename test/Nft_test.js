const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("My ERC721 Token Test", () => {
    let tokenURI = "https://mytokenuri.com";
    let tokenName = "My ERC721 Token";
    let tokenSymbol = "MTK";

    async function NftFixture() {
        const [owner, addr1, addr2] = await ethers.getSigners();
        const MyERC721Token = await ethers.getContractFactory("MyToken");
        const myToken = await MyERC721Token.deploy(tokenName, tokenSymbol);

        await myToken.deployed();

        return { myToken, owner, addr1, addr2 }
    }

    describe("Mint non-fungible tokens", () => {

        it("should set the right name and symbol", async () => {
            const {myToken, owner, addr1, addr2} = await loadFixture(NftFixture);

            expect(await myToken.name()).to.equal(tokenName);
            expect(await myToken.symbol()).to.equal(tokenSymbol);
        });

        it("should mint tokens to owner", async () => { 
            const {myToken, owner, addr1, addr2} = await loadFixture(NftFixture);

            expect(await myToken.balanceOf(owner.address)).to.equal(0);
            await myToken.safeMint(owner.address, tokenURI);

            expect(await myToken.balanceOf(owner.address)).to.equal(1);
            expect(await myToken.ownerOf(1)).to.equal(owner.address);
            expect(await myToken.tokenURI(1)).to.equal(tokenURI);
        });

        it("should emit an event", async () => {
            const {myToken, owner, addr1, addr2} = await loadFixture(NftFixture);
            const tx = await myToken.connect(owner).safeMint(owner.address, tokenURI);
            const receipt = await tx.wait();
            
            //console.log(receipt.events);
            expect(receipt.events[1].args._tokenId).to.equal(1);
            expect(receipt.events[1].args._owner).to.equal(owner.address);
            expect(receipt.events[1].args._tokenURI).to.equal(tokenURI);
        });

        it("should fail if the minter is not the owner", async () => {
            const {myToken, owner, addr1, addr2} = await loadFixture(NftFixture);

            await expect(myToken.connect(addr1).safeMint(addr1.address, tokenURI))
                .to.be.revertedWith(
                "Ownable: caller is not the owner"
            );

            expect(await myToken.balanceOf(addr1.address)).to.equal(0);
        });

        it("should be able to burn a token", async () => {
            const {myToken, owner, addr1, addr2} = await loadFixture(NftFixture);

            await myToken.safeMint(owner.address, tokenURI);
            await myToken.connect(owner).burn(1);

            expect(await myToken.balanceOf(owner.address)).to.equal(0);

            await expect(myToken.ownerOf(1))
                .to.be.revertedWith(
                "ERC721: invalid token ID"
                );
        });

        it("should not be able to burn a token", async () => {
            const {myToken, owner, addr1, addr2} = await loadFixture(NftFixture);
            
            await myToken.safeMint(addr1.address, tokenURI);
            await expect(myToken.connect(owner).burn(1))
                .to.be.revertedWith(
                "ERC721: caller is not token owner or approved"
                );
        });
    });

    describe("ERC721 Transactions", () => {

        it("should transfer tokens between accounts", async () => {
            const {myToken, owner, addr1, addr2} = await loadFixture(NftFixture);
            await myToken.safeMint(owner.address, tokenURI);

            // Get initial balances of first two accounts.
            const ownerBalance = await myToken.balanceOf(owner.address);
            const addr1Balance = await myToken.balanceOf(addr1.address);
            
            // Transfer tokens from owner to addr1.
            await myToken.transferFrom(owner.address, addr1.address, 1);

            // Check balances of first two accounts to ensure transfer occurred.
            expect(await myToken.balanceOf(owner.address)).to.equal(ownerBalance - 1);
            expect(await myToken.balanceOf(addr1.address)).to.equal(addr1Balance + 1);
        });

        it("Should fail if sender does not have enough tokens", async () => { 
            const {myToken, owner, addr1, addr2} = await loadFixture(NftFixture);
            // Try to transfer tokens from addr1 to addr2 when addr1 has no tokens.
            await myToken.safeMint(owner.address, tokenURI);

            await expect(myToken.connect(addr1).transferFrom(owner.address, addr2.address, 1))
                .to.be.revertedWith(
                "ERC721: caller is not token owner or approved"
            );
        });

        it("should be approved before transfering a token", async function () {
            const {myToken, owner, addr1, addr2} = await loadFixture(NftFixture);
            // Try to transfer tokens from addr1 to addr2 when addr1 has no tokens.
            await myToken.safeMint(owner.address, tokenURI);
            await myToken.approve(addr1.address, 1);

            await expect(myToken.connect(addr1).transferFrom(owner.address, addr2.address, 1))
                .not.to.be.reverted;

            expect(await myToken.ownerOf(1)).to.equal(addr2.address);
        });

        it("should be approved all tokens before transfering", async function () {
            const {myToken, owner, addr1, addr2} = await loadFixture(NftFixture);
            
            await myToken.safeMint(owner.address, tokenURI);
            await myToken.safeMint(owner.address, tokenURI);

            await myToken.setApprovalForAll(addr1.address, true);
            await expect(myToken.connect(addr1).transferFrom(owner.address, addr2.address, 1))
                .not.to.be.reverted;
            await expect(myToken.connect(addr1).transferFrom(owner.address, addr2.address, 2))
                .not.to.be.reverted;

            expect(await myToken.ownerOf(1)).to.equal(addr2.address);
            expect(await myToken.ownerOf(2)).to.equal(addr2.address);
        });
    });

});
