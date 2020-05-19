pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

contract ResultFeed {
    address public authorityAdmin;
    string[] public positiveEIDList;
    uint feedLength;

    event PositiveResult(string eid, string jurisdiction);

    constructor() public {
        // needs to be called by the authority in charge of the result feed
        authorityAdmin = msg.sender;
        feedLength = 0;
    }

    modifier checkAdmin() {
        // check the caller of the function is the authority they claim they are
        require(msg.sender == authorityAdmin, "need admin access");
        _;
    }

    function publishPositiveEncounter(string memory eid, string memory jdictionName)
        public checkAdmin()
    {
        emit PositiveResult(eid, jdictionName);
        positiveEIDList.push(eid);
        feedLength++;
    }

    function getLastPositiveEID()
        public view returns (string memory eid)
    {
        if (feedLength == 0) {
            return "None";
        } else {
            return positiveEIDList[feedLength - 1];
        }
    }
}
