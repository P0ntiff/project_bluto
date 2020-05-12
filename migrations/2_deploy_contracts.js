const MyStringStore = artifacts.require("MyStringStore");
const AuthorityRegistry = artifacts.require("AuthorityRegistry");
const ResultFeed = artifacts.require("ResultFeed");



module.exports = function(deployer) {
  deployer.deploy(MyStringStore);
  deployer.deploy(AuthorityRegistry);
  deployer.deploy(ResultFeed);
};
