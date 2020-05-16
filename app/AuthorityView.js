import React from "react";
import { Text, View, Button, TextInput, TouchableOpacity } from "react-native";

class AuthorityView extends React.Component {
  state = { emailKey: null, 
            phoneKey: null, 
            stackId: null, 
            text: "", 
            myAddress: null };

  submit = () => {
    this.setValue(this.state.text);
  };

  setValue = value => {
    const { drizzle, drizzleState, styles } = this.props;
    const contract = drizzle.contracts.MyStringStore;

    // let drizzle know we want to call the `set` method with `value`
    const stackId = contract.methods["set"].cacheSend(value, {
      from: drizzleState.accounts[0]
    });

    // save the `stackId` for later reference
    this.setState({ stackId });
  };

  getTxStatus = () => {
    // get the transaction states from the drizzle state
    const { transactions, transactionStack } = this.props.drizzleState;

    // get the transaction hash using our saved `stackId`
    const txHash = transactionStack[this.state.stackId];

    // if transaction hash does not exist, don't display anything
    if (!txHash) return null;

    // otherwise, return the transaction status
    if (transactions[txHash] && transactions[txHash].status)
      return `Txn ${transactions[txHash].status}`;

    return null;
  };

  displayAddress = () => {

    return <View style={this.props.styles.bodySection}>
            <Text style={this.props.styles.subHeading}> Authority address: </Text>
            <Text style={this.props.styles.bodyText}> {this.state.myAddress} </Text>
          </View>
  }

  setContactDetails = () => {
    //test
  }

  displayContactDetails = () => {
    const { AuthorityRegistry } = this.props.drizzleState.contracts;

    const email = AuthorityRegistry.getContactEmailForAuthority[this.state.emailKey];
    const phone = AuthorityRegistry.getContactPhoneForAuthority[this.state.phoneKey];

    if (!email) {
      //
    }
    return <View style={this.props.styles.bodySection}>
            <View style={{flexDirection : "row", justifyContent: "space-between"}}>
              <View>
                <Text style={this.props.styles.subHeading}> On-Ledger Email: </Text>
                <Text style={this.props.styles.bodyText}> Email is: {email && email.value} </Text>
                <Text style={this.props.styles.subHeading}> On-Ledger Phone: </Text>
                <Text style={this.props.styles.bodyText}> Phone is: {phone && phone.value} </Text>
              </View> 
              <View style={{justifyContent : 'center'}}>
                <TouchableOpacity onPress={this.setContactDetails} 
                    style={[this.props.styles.buttonStyle, { backgroundColor : '#4B0082'}]}> 
                  <Text style={this.props.styles.buttonText}>Update</Text>  
                </TouchableOpacity>
              </View>
            </View>
          </View>
  }

  
  componentDidMount() {
    const contract = this.props.drizzle.contracts.AuthorityRegistry;

    //get the address from drizzleState
    //authority modelled as address 0
    const myAddress = this.props.drizzleState.accounts[0];
    this.setState({ myAddress });

    emailKey = contract.methods.getContactEmailForAuthority.cacheCall(myAddress);
    this.setState({ emailKey });

    phoneKey = contract.methods.getContactPhoneForAuthority.cacheCall(myAddress);
    this.setState({ phoneKey });
  }


  render() {
    return (
      <View>
        <View style={this.props.styles.titleWrapper}>
          <Text style={[this.props.styles.title, { color : '#4B0082'}]}> Authority View </Text>
        </View>
        <View style={this.props.styles.bodyWrapper}>
          {this.displayAddress()}          
          {this.displayContactDetails()}
          <Text>{this.getTxStatus()}</Text>
        </View>
      </View>
    );
  }
}




export default AuthorityView;
