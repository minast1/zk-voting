// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockVerifier {
    bool public shouldVerify = true;

    function setResult(bool _result) external {
        shouldVerify = _result;
    }

    function verify(
        bytes calldata,
        bytes32[] calldata
    ) external view returns (bool) {
        return shouldVerify;
    }
}
