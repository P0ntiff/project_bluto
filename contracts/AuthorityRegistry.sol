pragma solidity ^0.5.0;

contract AuthorityRegistry {

    struct ContactDetails {
        string phone_number;
        address author;
    }

    struct Authority {
        address authority_address;
        bool exists;
        ContactDetails contact_details;
        mapping (address => bool) allowed_writers;
    }

    mapping (address => Authority) authorities;

    modifier allowedWriter(address _authority) {
        require(authorities[_authority].exists);
        require(authorities[_authority].allowed_writers[msg.sender]);
        _;
    }

    function addContactDetailsForAuthority(address _authority, string _phone_number) 
        public allowedWriter(_authority) returns (uint id)
    {
        authorities[_authority].contact_details = ContactDetails(_phone_number, msg.sender)
        return 0
    }

}