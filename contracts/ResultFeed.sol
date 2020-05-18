pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;


contract ResultFeed {
    address public authorityAdmin;
    string public jurisdiction;
    string[] public positiveEIDList;


    event PositiveResult(string eid, string jurisdiction);

    constructor() public {
        // needs to be called by the authority in charge of the result feed
        authorityAdmin = msg.sender;
    }

    modifier checkAdmin() {
        // check the caller of the function is the authority they claim they are
        require(msg.sender == authorityAdmin, "need admin access");
        _;
    }

    function setJurisdiction(string memory location)
        public checkAdmin()
    {
        jurisdiction = location;
    }

    function publishPositiveEncounter(string memory eid)
        public checkAdmin()
    {
        emit PositiveResult(eid, jurisdiction);
        positiveEIDList.push(eid);
    }
}
