const AuthorityRegistry = artifacts.require("AuthorityRegistry");

module.exports = function(deployer) {
  deployer.deploy(AuthorityRegistry);
};
