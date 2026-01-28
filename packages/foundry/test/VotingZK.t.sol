//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "forge-std/Test.sol";
//import {console} from "forge-std/console";
import "../contracts/Voting.sol";
import {HonkVerifier} from "../contracts/Verifier.sol";
import "poseidon-solidity/PoseidonT3.sol";

contract VotingZKTest is Test {
    Voting voting;
    HonkVerifier verifier;
    address voter1 = address(0x1234);
    uint256 pollId;
    LeanIMTData tree;

    function setUp() public {
        verifier = new HonkVerifier();

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

    function _getZkProofAndNullifierHash(
        uint256 _index,
        uint256 nullifier,
        uint256 secret,
        bool _vote,
        uint256[] memory _siblings,
        uint256 depth,
        uint256 root
    )
        public
        returns (
            bytes memory _proof,
            bytes32 _nullifierHash
            // bytes32 _root,
            // uint32 _depth
        )
    {
        uint256 inputSize = 9 + _siblings.length;
        string[] memory inputs = new string[](inputSize);
        inputs[0] = "node";
        inputs[1] = "scripts-js/generateProof.js";
        inputs[2] = vm.toString(pollId);
        inputs[3] = _vote ? "true" : "false";
        inputs[4] = vm.toString(_index);
        inputs[5] = vm.toString(nullifier);
        inputs[6] = vm.toString(secret);
        inputs[7] = vm.toString(depth);
        inputs[8] = vm.toString(root);

        for (uint256 i = 0; i < _siblings.length; i++) {
            inputs[9 + i] = vm.toString(_siblings[i]);
        }

        bytes memory result = vm.ffi(inputs);
        (_proof, _nullifierHash) = abi.decode(result, (bytes, bytes32));
    }

    function testFullZKVote() public {
        uint256[] memory leaves = new uint256[](1);
        uint256 nullifier = 12345;
        uint256 secret = 67890;
        bool vote = true;
        // In LeanIMT, leaf = hash(nullifier, secret)
        uint256 _commitment = PoseidonT3.hash([nullifier, secret]);
        leaves[0] = _commitment;

        vm.startPrank(voter1);
        voting.register(_commitment, pollId);
        (, , , , , , uint256 depth, uint256 root) = voting.getPoll(pollId);
        (bytes memory proof, bytes32 nullHash) = _getZkProofAndNullifierHash(
            0,
            nullifier,
            secret,
            vote,
            leaves,
            depth,
            root
        );
        // Sanity Checks
        // console.log("--- FFI Return Values ---");
        // console.log("Proof Length: ", proof.length);

        // console.log("Nullifier Hash:");
        // console.logBytes32(nullHash);

        // console.log("Merkle Root:");
        // console.logBytes32(root);

        // console.log("Tree Depth: ", uint256(depth));
        // console.log("-------------------------");

        voting.vote(
            pollId,
            proof,
            nullHash,
            bytes32(root),
            vote ? bytes32(uint256(1)) : bytes32(uint256(0)), //vote ? bytes32("1") : bytes32("0"),
            bytes32(uint256(depth))
        );
        vm.stopPrank();
    }
}
