pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import './ResultFeed.sol';

contract AuthorityRegistry {

    address admin;
    mapping (address => Authority) authorities;
    string[] public authorityNames;
    address[] public authorityAddresses;
    //each jurisdiction address
    mapping (string => Jurisdiction) jurisdictions;
    string[] public jurisdictionNames;

    struct ContactDetails {
        string phoneNumber;
        string emailAddress;
    }

    struct Authority {
        address authorityAddress;
        address parentAuthority;
        string authorityName;
        string currentJurisdiction;
        ContactDetails contactDetails;
        bool exists;
    }

    struct Jurisdiction {
        string jdictionName;
        address authority;
        bool exists;
    }

    constructor() public {
        admin = msg.sender;
        addAuthority(msg.sender, 'QLD Health');
    }

    modifier checkAdmin() {
        // check the caller of the function is the original contract creator
        require(msg.sender == admin, "need admin access");
        _;
    }

    modifier checkAuthority() {
        // check the caller of the function is an authority or the admin
        require((msg.sender == admin) || (authorities[msg.sender].exists), "authority check failed");
        _;
    }

    modifier checkCredentials(address authAddr) {
        // check the caller of the function is an authority, or the authority who created that authority
        require(authorities[authAddr].exists, "authority does not exist");
        require(msg.sender == authorities[authAddr].parentAuthority ||
                msg.sender == authorities[authAddr].authorityAddress, "need to be the authority");
        _;
    }

    function addAuthority(address authAddr, string memory authName)
        // only existing authorities can add other authorities (incl. admin)
        public checkAuthority()
    {
        // check authority doesn't already exist
        require(!authorities[authAddr].exists, "an authority with this address exists");
        authorities[authAddr] = Authority(
            authAddr, msg.sender, authName, "", ContactDetails("", ""), true
        );
        authorityNames.push(authName);
        authorityAddresses.push(authAddr);
        // see addJurisdiction() below
        // see setContactDetailsForAuthority() below as well
    }

    function removeAuthority(address authAddr)
        public checkCredentials(authAddr)
    {
        // stub for now
        delete(authorities[authAddr]);
        // TODO remove from other lists
    }

    function addJurisdiction(string memory jdictionName, address auth)
        public checkCredentials(auth)
    {
        // check there's no jurisdiction clash
        require(!jurisdictions[jdictionName].exists, "this jurisdiction already exists");

        // add new jurisdiction to list of jurisdictions
        jurisdictionNames.push(jdictionName);
        jurisdictions[jdictionName] = Jurisdiction(jdictionName, auth, true);

        // associate under Authority
        authorities[auth].currentJurisdiction = jdictionName;
    }

    function setContactDetailsForAuthority(address authAddr, string memory phone, string memory email)
        public checkCredentials(authAddr)
    {
        authorities[authAddr].contactDetails = ContactDetails(phone, email);
    }

    function getContactPhoneForAuthority(address authAddr)
        public view returns (string memory phone)
    {
        require(authorities[authAddr].exists, "requested authority does not exist");
        return authorities[authAddr].contactDetails.phoneNumber;
    }

    function getContactEmailForAuthority(address authAddr)
        public view returns (string memory email)
    {
        require(authorities[authAddr].exists, "requested authority does not exist");
        return authorities[authAddr].contactDetails.emailAddress;
    }

    function setCurrentJurisdiction(address authAddr, string memory jdictionName)
        public checkCredentials(authAddr)
    {
        require(jurisdictions[jdictionName].exists, "jurisdiction with that name does not exist");
        authorities[authAddr].currentJurisdiction = jdictionName;
    }

    function getCurrentJurisdiction(address authAddr)
        public view returns (string memory jdictionName)
    {
        return authorities[authAddr].currentJurisdiction;
    }

}