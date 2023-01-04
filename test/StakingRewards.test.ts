import { ethers } from "hardhat";
import { expect } from "chai";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Cupcake, Donut, StakingReward } from "../typechain-types";

describe("StakingRewards", () => {
  const ONE_YEAR_IN_SECONDS = 31536000;
  const ONE_MONTH_IN_SECONDS = 2592000;
  let currenTimestamp;
  let stakingReward: StakingReward;
  let stakingToken: Cupcake;
  let stakingTokenDecimals = 8;
  let stakingTokenTotalSupply = ethers.utils.parseUnits(
    "1000000000",
    stakingTokenDecimals
  );
  let rewardToken: Donut;
  let rewardTokenDecimals = 12;
  let rewardTokenInitialSupply = ethers.utils.parseUnits(
    "1000000",
    rewardTokenDecimals
  );
  let owner: SignerWithAddress;
  let users: SignerWithAddress[];
  let tx;
  let receipt;

  before(async () => {
    [owner, ...users] = await ethers.getSigners();

    let StakingToken = await ethers.getContractFactory("Cupcake");
    stakingToken = await StakingToken.deploy(stakingTokenTotalSupply);
    await stakingToken.deployed();
    console.log(`Cupcake (staking token) deployed at: ${stakingToken.address}`);

    // transfer some staking tokens form owner to users
    for (let i = 0; i < 5; i++) {
      tx = await stakingToken.transfer(
        users[i].address,
        ethers.utils.parseUnits("1000", stakingTokenDecimals)
      );
      receipt = await tx.wait();
      console.log(
        `staking token transfer to user${i} ${receipt.transactionHash}`
      );
    }

    let RewardToken = await ethers.getContractFactory("Donut");
    rewardToken = await RewardToken.deploy(rewardTokenInitialSupply);
    await rewardToken.deployed();
    console.log(`Donut (reward token) deployed at: ${rewardToken.address}`);

    let StakingReward = await ethers.getContractFactory("StakingReward");
    stakingReward = await StakingReward.deploy(
      stakingToken.address,
      rewardToken.address
    );
    await stakingReward.deployed();
    console.log(`Staking Reward deployed at: ${stakingReward.address}`);
  });

  describe("stake", () => {
    let amount;
    it("should stake the given amount", async () => {
      amount = ethers.utils.parseUnits("100", stakingTokenDecimals);
      await expect(
        stakingToken.connect(users[0]).approve(stakingReward.address, amount)
      ).not.to.be.reverted;

      await expect(
        stakingReward.connect(users[0]).stake(amount)
      ).to.changeTokenBalance(stakingToken, stakingReward, amount);

      await expect(
        stakingToken.connect(users[1]).approve(stakingReward.address, amount)
      ).not.to.be.reverted;

      await expect(
        stakingReward.connect(users[1]).stake(amount)
      ).to.changeTokenBalance(stakingToken, stakingReward, amount);

      await expect(
        stakingToken.connect(users[2]).approve(stakingReward.address, amount)
      ).not.to.be.reverted;

      await expect(
        stakingReward.connect(users[2]).stake(amount)
      ).to.changeTokenBalance(stakingToken, stakingReward, amount);
    });
  });

  describe("withdraw", () => {
    let amount;
    it("should withdraw the given amount", async () => {
      amount = ethers.utils.parseUnits("100", stakingTokenDecimals);

      await expect(
        stakingReward.connect(users[0]).withdraw(amount)
      ).to.changeTokenBalance(stakingToken, users[0], amount);
    });
  });

  describe("earned", () => {
    it("should return the amount of reward tokens earned by the user", async () => {
      currenTimestamp = await time.latest();
      let increase = currenTimestamp + ONE_MONTH_IN_SECONDS;
      currenTimestamp = await time.increaseTo(increase);

      let user1rewardBalance: any = await stakingReward.earned(
        users[1].address
      );
      user1rewardBalance = ethers.utils.formatUnits(
        user1rewardBalance,
        rewardTokenDecimals
      );
      user1rewardBalance = parseFloat(user1rewardBalance);
      let expectedUser1Rewards =
        (((100 * ONE_MONTH_IN_SECONDS) / ONE_YEAR_IN_SECONDS) * 12) / 100;

      console.log(`
      expected: ${expectedUser1Rewards}
      actual: ${user1rewardBalance}
      `);

      expect(user1rewardBalance).to.approximately(expectedUser1Rewards, 0.001);
    });
  });
});
