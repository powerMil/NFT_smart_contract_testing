const { ethers } = require("hardhat");

async function main() {
  const balance = await ethers.provider.getBalance(
    "0x1234567890123456789012345678901234567890"
  );
  console.log("Balance:", ethers.utils.formatEther(balance));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
     console.error(error);
    process.exit(1);
  });
