import { ethers } from "hardhat";
import { expect } from "chai";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  Cupcake,
  Donut,
  StakingRewardsFacet,
  DiamondCutFacet,
  DiamondInit,
} from "../typechain-types";
import { deployDiamond } from "../scripts/deploy";

const {
  getSelectors,
  FacetCutAction,
} = require("../scripts/libraries/diamond.js");

describe("StakingRewardsFacet", () => {
  const ONE_YEAR_IN_SECONDS = 31536000;
  const ONE_MONTH_IN_SECONDS = 2592000;
  let currenTimestamp;
  let stakingRewardsFacet: StakingRewardsFacet;
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
  let rewardRate = 12;
  let owner: SignerWithAddress;
  let users: SignerWithAddress[];
  let tx;
  let receipt;

  before(async () => {
    [owner, ...users] = await ethers.getSigners();

    // deploy staking token
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
    }

    // deploy reward token
    let RewardToken = await ethers.getContractFactory("Donut");
    rewardToken = await RewardToken.deploy(rewardTokenInitialSupply);
    await rewardToken.deployed();
    console.log(`Donut (reward token) deployed at: ${rewardToken.address}`);

    // deploy Diamond
    let { diamond, diamondInit } = await deployDiamond();

    // deploy staking rewards facet
    let StakingRewardsFacet = await ethers.getContractFactory(
      "StakingRewardsFacet"
    );
    stakingRewardsFacet = await StakingRewardsFacet.deploy();
    await stakingRewardsFacet.deployed();

    // initialize state variables for staking rewards facet
    let diamondInitInstance = await ethers.getContractAt(
      "DiamondInit",
      diamondInit
    );
    let functionCall = diamondInitInstance.interface.encodeFunctionData(
      "init_StakingRewardsFacet",
      [stakingToken.address, rewardToken.address, rewardRate]
    );

    // upgrade Diamond with staking rewards facet address
    const cut = [];
    cut.push({
      facetAddress: stakingRewardsFacet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectors(stakingRewardsFacet),
    });
    let diamondCutFacet = await ethers.getContractAt("IDiamondCut", diamond);

    tx = await diamondCutFacet.diamondCut(cut, diamondInit, functionCall);
    receipt = await tx.wait();
    if (!receipt.status) {
      throw Error(`Diamond upgrade failed: ${tx.hash}`);
    }

    // Initialize staking rewards facet with diamond address
    stakingRewardsFacet = await ethers.getContractAt(
      "StakingRewardsFacet",
      diamond
    );

    // Transfer reward tokens to Diamond
    tx = await rewardToken.transfer(diamond, rewardTokenInitialSupply);
    receipt = await tx.wait();
  });

  describe("stake", () => {
    let amount;
    it("shoulde revert if stake amount is 0", async () => {
      amount = 0;
      await expect(
        stakingRewardsFacet.connect(users[0]).stake(amount)
      ).to.be.revertedWithCustomError(stakingRewardsFacet, "ZeroAmount");
    });

    it("should stake the given amount", async () => {
      amount = ethers.utils.parseUnits("100", stakingTokenDecimals);
      await expect(
        stakingToken
          .connect(users[0])
          .approve(stakingRewardsFacet.address, amount)
      ).not.to.be.reverted;

      await expect(
        stakingRewardsFacet.connect(users[0]).stake(amount)
      ).to.changeTokenBalance(stakingToken, stakingRewardsFacet, amount)
        .to.emit(stakingRewardsFacet, "Staked");
    });

    it("should revert if staked during lock in period", async () => {
      amount = ethers.utils.parseUnits("100", stakingTokenDecimals);
      await expect(
        stakingRewardsFacet.connect(users[0]).stake(amount)
      ).to.be.revertedWithCustomError(stakingRewardsFacet, "LockInPeriod");
    });
  });

  describe("withdraw", () => {
    let amount;
    it("should revert if withdrawn during lock-in period", async () => {
      amount = ethers.utils.parseUnits("100", stakingTokenDecimals);

      await expect(
        stakingRewardsFacet.connect(users[0]).withdraw(amount)
      ).to.be.revertedWithCustomError(stakingRewardsFacet, "LockInPeriod");
    });

    it("should distribute rewards if withdraw amount is 0", async () => {
      currenTimestamp = await time.latest();
      let increase = currenTimestamp + ONE_YEAR_IN_SECONDS;
      currenTimestamp = await time.increaseTo(increase);

      let user0rewardBalance: any = await stakingRewardsFacet.earned(
        users[0].address
      );

      await expect(stakingRewardsFacet.connect(users[0]).withdraw(0))
        .to.emit(stakingRewardsFacet, "RewardsPaid")
        .not.to.emit(stakingRewardsFacet, "Withdraw")
        .to.changeTokenBalance(stakingToken, users[0], user0rewardBalance);
    });

    it("should withdraw given amount and distribute rewards", async () => {
      //user[1]
      amount = ethers.utils.parseUnits("100", stakingTokenDecimals);

      // approve
      await expect(
        stakingToken
          .connect(users[1])
          .approve(stakingRewardsFacet.address, amount)
      ).not.to.be.reverted;

      // stake
      await expect(
        stakingRewardsFacet.connect(users[1]).stake(amount)
      ).to.changeTokenBalance(stakingToken, stakingRewardsFacet, amount);

      // wait lock-in period
      currenTimestamp = await time.latest();
      let increase = currenTimestamp + ONE_YEAR_IN_SECONDS;
      currenTimestamp = await time.increaseTo(increase);

      // withdraw amount and rewards
      await expect(stakingRewardsFacet.connect(users[1]).withdraw(amount))
        .to.emit(stakingRewardsFacet, "RewardsPaid")
        .to.emit(stakingRewardsFacet, "Withdraw")
        .to.changeTokenBalance(stakingToken, users[1], amount);
    });
  });

  describe("earned", () => {
    let amount;
    it("shoulde revert if account is zero address", async () => {
      await expect(
        stakingRewardsFacet
          .connect(users[0])
          .earned(ethers.constants.AddressZero)
      ).to.be.revertedWithCustomError(stakingRewardsFacet, "ZeroAddress");
    });

    it("should return zero for unstaked users", async () => {
      expect(
        await stakingRewardsFacet.connect(users[3]).earned(users[3].address)
      ).to.be.equal(0);
    });

    it("should return the amount of reward tokens earned by the user", async () => {
      //user[2]
      amount = ethers.utils.parseUnits("100", stakingTokenDecimals);

      // approve
      await expect(
        stakingToken
          .connect(users[2])
          .approve(stakingRewardsFacet.address, amount)
      ).not.to.be.reverted;

      // stake
      await expect(
        stakingRewardsFacet.connect(users[2]).stake(amount)
      ).to.changeTokenBalance(stakingToken, stakingRewardsFacet, amount);

      // wait one month
      currenTimestamp = await time.latest();
      let increase = currenTimestamp + ONE_MONTH_IN_SECONDS;
      currenTimestamp = await time.increaseTo(increase);

      // get user[2] rewards earned
      let user2rewardBalance: any = await stakingRewardsFacet.earned(
        users[2].address
      );
      user2rewardBalance = ethers.utils.formatUnits(
        user2rewardBalance,
        rewardTokenDecimals
      );
      user2rewardBalance = parseFloat(user2rewardBalance);

      let expectedUser2Rewards =
        (((100 * ONE_MONTH_IN_SECONDS) / ONE_YEAR_IN_SECONDS) * 12) / 100;

      console.log(`
        expected: ${expectedUser2Rewards}
        actual: ${user2rewardBalance}
      `);

      expect(user2rewardBalance).to.approximately(expectedUser2Rewards, 0.001);
    });
  });
});
