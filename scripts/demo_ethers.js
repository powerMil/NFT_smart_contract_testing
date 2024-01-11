const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {

    // Comunicate with a contract
    // 0x5fbdb2315678afecb367f032d93f642f64180aa3
    const myContract = await ethers.getContractAt(
        "MyToken",
        "0x5fbdb2315678afecb367f032d93f642f64180aa3"
    );

    const contractOwner = await myContract.owner();
    console.log("Contract Owner: ", contractOwner);

    // Get Account Balance
    const accounts = await ethers.getSigners();
    const firstAccount = accounts[0].address;
    console.log("Signer 0: ", firstAccount);

    const balance = await ethers.provider.getBalance(
        firstAccount
    );

    console.log("Balance: ", ethers.utils.formatEther(balance));

    // Create an Ethereum provider
    const provider = ethers.getDefaultProvider();

    // Create an Ethereum wallet from a private key
    const privateKey = process.env.MAIN_ACCOUNT;
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log("New Wallet: ", wallet.address);

    // Send a transaction
    const receiverAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    const amountInEther = "50";

    const tx = {
        to: receiverAddress,
        value: ethers.utils.parseEther(amountInEther)
    }
    const receipt = await accounts[0].sendTransaction(tx);
    receipt.wait();
    console.log("tx hash: ", receipt.hash);

    const newBalance = await ethers.provider.getBalance(
        accounts[1].address
    );

    console.log("Balance receiver: ", ethers.utils.formatEther(
        newBalance
    ));
 
}


main()
   .then(() => process.exit(0))
   .catch((error) => {
       console.error(error);
       process.exit(1);
   });
