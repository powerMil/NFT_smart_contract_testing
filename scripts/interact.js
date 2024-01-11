const { ethers } = require("hardhat");

async function main() {
    const myContract = await ethers.getContractAt(
        "Lock", 
        "0x41392AC9ba6399F085f0B1fB8Bb1655E98699990"
    );
    
    console.log(await myContract.owner());
    console.log((await myContract.unlockTime()).toNumber());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
