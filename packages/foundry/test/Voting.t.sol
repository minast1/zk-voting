//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "forge-std/Test.sol";
import "../contracts/Voting.sol";
import {MockVerifier} from "./mocks/MockVerifier.sol";

contract VotingContractTest is Test {
    uint256 public votes;
    MockVerifier verifier;
    address public owner = address(this);
    address voter1 = makeAddr("voter1");
    address voter2 = makeAddr("voter2");
    Voting public voting;
    uint256 constant DUMMY_COMMITMENT = 12345;
    bytes32 constant DUMMY_NULLIFIER = bytes32(uint256(111));

    function setUp() public {
        vm.deal(owner, 2 ether);
        verifier = new MockVerifier();
        voting = new Voting(
            address(this),
            address(verifier),
            "Should we deploy zk voting?"
        );
    }

    function testOwnerCanAddVoters() public {
        address[] memory voters = new address[](1);
        bool[] memory statuses = new bool[](1);
        voters[0] = voter1;
        statuses[0] = true;

        voting.addVoters(voters, statuses);
        (bool allowed, bool registered) = voting.getVoterData(voter1);
        assertTrue(allowed);
        assertFalse(registered);
    }

    function testNonOwnerCannotAddVoters() public {
        address[] memory voters = new address[](1);
        bool[] memory statuses = new bool[](1);
        voters[0] = voter1;
        statuses[0] = true;
        vm.startPrank(makeAddr("non_owner"));
        vm.expectRevert();
        voting.addVoters(voters, statuses);
        vm.stopPrank();
    }

    function testRegisterCommitment() public {
        address[] memory voters = new address[](1);
        bool[] memory statuses = new bool[](1);
        voters[0] = voter1;
        statuses[0] = true;

        voting.addVoters(voters, statuses);
        vm.prank(voter1);
        voting.register(DUMMY_COMMITMENT);

        (, , , , uint256 size, , ) = voting.getVotingData();
        assertEq(size, 1);
    }

    function testCannotRegisterTwice() public {
        address[] memory voters = new address[](1);
        bool[] memory statuses = new bool[](1);
        voters[0] = voter1;
        statuses[0] = true;

        voting.addVoters(voters, statuses);
        vm.prank(voter1);
        voting.register(DUMMY_COMMITMENT);
        vm.prank(voter1);
        vm.expectRevert(
            abi.encodeWithSelector(Voting.Voting__NotAllowedToVote.selector)
        );
        voting.register(DUMMY_COMMITMENT);
    }

    function testSuccessfullVoteYes() public {
        address[] memory voters = new address[](1);
        bool[] memory statuses = new bool[](1);
        voters[0] = voter1;
        statuses[0] = true;

        voting.addVoters(voters, statuses);
        vm.startPrank(voter1);
        voting.register(DUMMY_COMMITMENT);

        (, , , , , , uint256 root) = voting.getVotingData();
        bytes32 voteYes = bytes32(uint256(1));
        bytes32 depth = bytes32(uint256(16));
        bytes memory proof = hex"deadbeef";

        voting.vote(proof, DUMMY_NULLIFIER, bytes32(root), voteYes, depth);
        (, , uint256 yesVotes, uint256 noVotes, , , ) = voting.getVotingData();
        assertEq(yesVotes, 1);
        assertEq(noVotes, 0);
    }

    function testCannotReuseNullifierHash() public {
        testSuccessfullVoteYes();

        (, , , , , , uint256 root) = voting.getVotingData();
        bytes memory proof = hex"deadbeef";

        vm.expectRevert(
            abi.encodeWithSelector(
                Voting.Voting__NullifierHashAlreadyUsed.selector,
                DUMMY_NULLIFIER
            )
        );
        voting.vote(
            proof,
            DUMMY_NULLIFIER,
            bytes32(root),
            bytes32(uint256(1)),
            bytes32(uint256(16))
        );
    }

    function testInvalidProofReverts() public {
        //allow voter
        address[] memory voters = new address[](1);
        bool[] memory statuses = new bool[](1);
        voters[0] = voter1;
        statuses[0] = true;

        voting.addVoters(voters, statuses);
        vm.prank(voter1);
        voting.register(DUMMY_COMMITMENT);
        //Force verifier failure

        verifier.setResult(false);

        (, , , , , , uint256 root) = voting.getVotingData();
        vm.startPrank(voter1);
        vm.expectRevert(Voting.Voting__InvalidProof.selector);

        voting.vote(
            hex"deadbeef",
            DUMMY_NULLIFIER,
            bytes32(root),
            bytes32(uint256(1)),
            bytes32(uint256(16))
        );
    }
}
