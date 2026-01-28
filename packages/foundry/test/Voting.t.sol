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
    uint256 public pollId;
    Voting public voting;
    uint256 constant DUMMY_COMMITMENT = 12345;
    bytes32 constant DUMMY_NULLIFIER = bytes32(uint256(111));

    event AllowListRequest(address indexed requester, uint256 timestamp);

    function setUp() public {
        vm.deal(owner, 2 ether);
        verifier = new MockVerifier();
        voting = new Voting(address(this), address(verifier));

        //Create Poll
        pollId = voting.createPoll(
            "Should we test this poll..?",
            block.timestamp - 1,
            block.timestamp + 1 days
        );

        // allowlist voter1
        address[] memory voters = new address[](1);
        bool[] memory statuses = new bool[](1);
        voters[0] = voter1;
        statuses[0] = true;
        voting.addVoters(voters, pollId, statuses);
    }

    function testOwnerCanAddVoters() public view {
        (bool allowed, bool registered) = voting.getVoterData(voter1, pollId);
        assertTrue(allowed);
        assertFalse(registered);
    }

    function testRevertIfNotAllowListed() public {
        vm.expectRevert(
            abi.encodeWithSelector(Voting.Voting__NotAllowedToVote.selector)
        );
        voting.register(DUMMY_COMMITMENT, pollId);
    }

    // function testNonOwnerCannotAddVoters() public {
    //     address[] memory voters = new address[](1);
    //     bool[] memory statuses = new bool[](1);
    //     voters[0] = voter2;
    //     statuses[0] = true;
    //     vm.startPrank(makeAddr("non_owner"));
    //     vm.expectRevert();
    //     voting.addVoters(voters, pollId, statuses);
    //     vm.stopPrank();
    // }

    function testRegisterCommitment() public {
        vm.prank(voter1);
        voting.register(DUMMY_COMMITMENT, pollId);

        (, , , , , uint256 size, , ) = voting.getPoll(pollId);
        assertEq(size, 1);
    }

    function testCannotRegisterTwice() public {
        vm.startPrank(voter1);
        voting.register(DUMMY_COMMITMENT, pollId);

        vm.expectRevert(
            abi.encodeWithSelector(Voting.Voting__AlreadyRegistered.selector)
        );
        voting.register(22323322, pollId);
        vm.stopPrank();
    }

    function testVoteYes() public {
        vm.startPrank(voter1);
        voting.register(DUMMY_COMMITMENT, pollId);

        (, , , , , , , uint256 root) = voting.getPoll(pollId);
        bytes32 voteYes = bytes32(uint256(1));
        bytes32 depth = bytes32(uint256(16));
        bytes memory proof = hex"deadbeef";

        voting.vote(
            pollId,
            proof,
            DUMMY_NULLIFIER,
            bytes32(root),
            voteYes,
            depth
        );
        (, uint256 yesVotes, uint256 noVotes, , , , , ) = voting.getPoll(
            pollId
        );

        assertEq(yesVotes, 1);
        assertEq(noVotes, 0);
    }

    function testVoteNo() public {
        vm.startPrank(voter1);
        voting.register(DUMMY_COMMITMENT, pollId);

        (, , , , , , , uint256 root) = voting.getPoll(pollId);
        bytes32 voteNo = bytes32(uint256(2));
        bytes32 depth = bytes32(uint256(16));
        bytes memory proof = hex"deadbeef";

        voting.vote(
            pollId,
            proof,
            DUMMY_NULLIFIER,
            bytes32(root),
            voteNo,
            depth
        );
        (, uint256 yesVotes, uint256 noVotes, , , , , ) = voting.getPoll(
            pollId
        );

        assertEq(yesVotes, 0);
        assertEq(noVotes, 1);
    }

    function testRevertDoubleVote() public {
        vm.startPrank(voter1);
        voting.register(DUMMY_COMMITMENT, pollId);

        (, , , , , , , uint256 root) = voting.getPoll(pollId);
        bytes32 voteYes = bytes32(uint256(1));
        bytes32 depth = bytes32(uint256(16));
        bytes memory proof = hex"deadbeef";

        voting.vote(
            pollId,
            proof,
            DUMMY_NULLIFIER,
            bytes32(root),
            voteYes,
            depth
        );

        vm.expectRevert(
            abi.encodeWithSelector(
                Voting.Voting__NullifierHashAlreadyUsed.selector,
                DUMMY_NULLIFIER
            )
        );
        voting.vote(
            pollId,
            proof,
            DUMMY_NULLIFIER,
            bytes32(root),
            voteYes,
            depth
        );
    }

    function testRevertInvalidProof() public {
        vm.prank(voter1);
        voting.register(DUMMY_COMMITMENT, pollId);
        //Force verifier failure

        verifier.setResult(false);

        (, , , , , , , uint256 root) = voting.getPoll(pollId);
        vm.startPrank(voter1);
        vm.expectRevert(Voting.Voting__InvalidProof.selector);

        voting.vote(
            pollId,
            hex"deadbeef",
            DUMMY_NULLIFIER,
            bytes32(root),
            bytes32(uint256(1)),
            bytes32(uint256(16))
        );
    }

    function testRevertInvalidRoot() public {
        vm.startPrank(voter1);
        voting.register(DUMMY_COMMITMENT, pollId);

        vm.startPrank(voter1);
        vm.expectRevert(Voting.Voting__InvalidRoot.selector);

        voting.vote(
            pollId,
            hex"deadbeef",
            DUMMY_NULLIFIER,
            keccak256("root"),
            bytes32(uint256(1)),
            bytes32(uint256(16))
        );
        vm.stopPrank();
    }

    function testRevertVotingClosed() public {
        vm.startPrank(voter1);
        voting.register(DUMMY_COMMITMENT, pollId);
        (, , , uint256 startTime, , , , uint256 root) = voting.getPoll(pollId);
        uint256 endTime = 1 days + 1 minutes;
        vm.warp(startTime + endTime);
        vm.startPrank(voter1);
        vm.expectRevert(Voting.Voting__VotingClosed.selector);

        voting.vote(
            pollId,
            hex"deadbeef",
            DUMMY_NULLIFIER,
            bytes32(root),
            bytes32(uint256(1)),
            bytes32(uint256(16))
        );
        vm.stopPrank();
    }

    function testRequestAllowListEmitsEvent() public {
        vm.prank(voter2);

        vm.expectEmit(true, false, false, true);
        emit AllowListRequest(voter2, block.timestamp);

        voting.requestAllowList();
    }
}
