//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {LeanIMT, LeanIMTData} from "@zk-kit/lean-imt.sol/LeanIMT.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
/// Checkpoint 6 //////
import {IVerifier} from "./Verifier.sol";

contract Voting is Ownable {
    using LeanIMT for LeanIMTData;

    //////////////////
    /// Errors //////
    /////////////////

    error Voting__CommitmentAlreadyAdded(uint256 commitment);
    error Voting__NullifierHashAlreadyUsed(bytes32 nullifierHash);
    error Voting__InvalidProof();
    error Voting__NotAllowedToVote();
    error Voting__EmptyTree();
    error Voting__InvalidRoot();
    error Voting__InvalidTimeWindow();
    error Voting__InvalidPoll();
    error Voting__AlreadyRegistered();
    error Voting__VotingClosed();

    struct Poll {
        string question;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 startTime;
        uint256 endTime;
        LeanIMTData tree;
        mapping(bytes32 => bool) nullifierHashes;
        mapping(uint256 => bool) commitments;
        bool exists;
    }

    ///////////////////////
    /// State Variables ///
    ///////////////////////

    uint256 private s_pollCount;
    mapping(uint256 => Poll) private s_polls;

    mapping(address => bool) private s_voters;
    //mapping(uint256 => uint256) private s_allowedVoters;
    mapping(uint256 => mapping(address => bool)) private s_hasRegistered;

    IVerifier private i_verifier;

    /// Checkpoint 6 //////

    //////////////
    /// Events ///
    //////////////

    event VoterAdded(address indexed voter, uint256 indexed poll_id);
    event NewLeaf(uint256 index, uint256 value);
    event AllowListRequest(address indexed requester, uint256 timestamp);
    // event PollExpired(
    //     uint256 indexed pollId,
    //     uint256 timestamp,
    //     uint256 yesVotes,
    //     uint256 noVotes
    // );

    event CommitmentRegistered(
        uint256 indexed pollId,
        uint256 index,
        uint256 value
    );
    event PollCreated(
        uint256 indexed pollId,
        string question,
        uint256 startTime,
        uint256 endTime
    );
    event VoteCast(
        uint256 indexed pollId,
        bytes32 indexed nullifierHash,
        bool vote,
        uint256 timestamp,
        uint256 totalYes,
        uint256 totalNo
    );
    //////////////////
    ////Constructor///
    //////////////////

    constructor(address _owner, address _verifier) Ownable(_owner) {
        i_verifier = IVerifier(_verifier);
    }

    //////////////////
    /// Functions ///
    //////////////////
    function createPoll(
        ////// Remove onlyOwner for demo purposes
        string calldata question,
        uint256 startTime,
        uint256 endTime
    ) external returns (uint256 pollId) {
        if (startTime > endTime || endTime < block.timestamp) {
            revert Voting__InvalidTimeWindow();
        }
        pollId = ++s_pollCount;
        Poll storage poll = s_polls[pollId];
        poll.question = question;
        poll.startTime = startTime;
        poll.endTime = endTime;
        poll.exists = true;
        emit PollCreated(pollId, question, startTime, endTime);
    }
    /**
     * @notice Batch updates the allowlist of voter EOAs
     * @dev Only the contract owner can call this function. Emits `VoterAdded` for each updated entry.
     * @param voters Addresses to update in the allowlist
     * @param statuses True to allow, false to revoke
     */
    function addVoters(
        address[] calldata voters,
        uint256 pollId,
        bool[] calldata statuses
    ) public {
        //Remove onlyOwner for demo purposes
        require(
            voters.length == statuses.length,
            "Voters and statuses length mismatch"
        );

        for (uint256 i = 0; i < voters.length; i++) {
            s_voters[voters[i]] = statuses[i];
            emit VoterAdded(voters[i], pollId);
        }
    }

    /**
     * @notice Registers a commitment leaf for an allowlisted address
     * @dev A given allowlisted address can register exactly once. Reverts if
     *      the caller is not allowlisted or has already registered, or if the
     *      same commitment has been previously inserted. Emits `NewLeaf`.
     * @param _commitment The Poseidon-based commitment to insert into the IMT
     */
    function register(uint256 _commitment, uint256 pollId) public {
        Poll storage poll = s_polls[pollId];
        if (!poll.exists) {
            revert Voting__InvalidPoll();
        }
        // check if the caller is not already registered
        if (!s_voters[msg.sender]) {
            revert Voting__NotAllowedToVote();
        }
        if (s_hasRegistered[pollId][msg.sender]) {
            revert Voting__AlreadyRegistered();
        }
        if (poll.commitments[_commitment]) {
            revert Voting__CommitmentAlreadyAdded(_commitment);
        }
        s_hasRegistered[pollId][msg.sender] = true;
        poll.commitments[_commitment] = true;

        poll.tree.insert(_commitment);
        emit CommitmentRegistered(pollId, poll.tree.size - 1, _commitment);
    }

    /**
     * @notice Casts a vote using a zero-knowledge proof
     * @dev Enforces single-use via `s_nullifierHashes`. Public inputs order must
     *      match the circuit: root, nullifierHash, vote, depth. The `_vote`
     *      value is interpreted as: 1 => yes, any other value => no. Emits `VoteCast`.
     * @param _proof Ultra Honk proof bytes
     * @param _root Merkle root corresponding to the registered commitments tree
     * @param _nullifierHash Unique nullifier to prevent double voting
     * @param _vote Encoded vote: 1 for yes, otherwise counted as no
     * @param _depth Tree depth used by the circuit
     */
    function vote(
        uint256 _pollId,
        bytes calldata _proof,
        bytes32 _nullifierHash,
        bytes32 _root,
        bytes32 _vote,
        bytes32 _depth
    ) public {
        Poll storage poll = s_polls[_pollId];
        if (!poll.exists) {
            revert Voting__InvalidPoll();
        }
        if (
            block.timestamp < poll.startTime || block.timestamp > poll.endTime
        ) {
            revert Voting__VotingClosed();
        }
        /// Checkpoint 6 //////
        if (_root == bytes32(0)) {
            revert Voting__EmptyTree();
        }
        if (_root != bytes32(poll.tree.root())) {
            revert Voting__InvalidRoot();
        }

        if (poll.nullifierHashes[_nullifierHash])
            revert Voting__NullifierHashAlreadyUsed(_nullifierHash);

        bytes32[] memory publicInputs = new bytes32[](5);
        publicInputs[0] = _nullifierHash;
        publicInputs[1] = _root;
        publicInputs[2] = _vote;
        publicInputs[3] = _depth;
        publicInputs[4] = bytes32(_pollId);

        if (!i_verifier.verify(_proof, publicInputs)) {
            revert Voting__InvalidProof();
        }
        poll.nullifierHashes[_nullifierHash] = true;

        if (_vote == bytes32(uint256(1))) {
            poll.yesVotes++;
        } else {
            poll.noVotes++;
        }
        emit VoteCast(
            _pollId,
            _nullifierHash,
            _vote == bytes32(uint256(1)),
            block.timestamp,
            poll.yesVotes,
            poll.noVotes
        );
    }

    /////////////////////////
    /// Getter Functions ///
    ////////////////////////
    function getPoll(
        uint256 pollId
    )
        external
        view
        returns (
            string memory question,
            uint256 yesVotes,
            uint256 noVotes,
            uint256 startTime,
            uint256 endTime,
            uint256 size,
            uint256 depth,
            uint256 root
        )
    {
        Poll storage poll = s_polls[pollId];
        if (!poll.exists) {
            revert Voting__InvalidPoll();
        }
        return (
            poll.question,
            poll.yesVotes,
            poll.noVotes,
            poll.startTime,
            poll.endTime,
            poll.tree.size,
            poll.tree.depth,
            poll.tree.root()
        );
    }

    function getVoterData(
        address _voter,
        uint256 pollId
    ) public view returns (bool voter, bool registered) {
        voter = s_voters[_voter];
        // /// Checkpoint 2 //////
        registered = s_hasRegistered[pollId][_voter];
    }

    function requestAllowList() external {
        emit AllowListRequest(msg.sender, block.timestamp);
    }

    function getPollCount() external view returns (uint256) {
        return s_pollCount;
    }
}
