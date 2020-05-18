import React from "react";
import { Text, View, Button, TextInput, 
          TouchableOpacity, Modal, FlatList,
          AsyncStorage } from "react-native";


const mockJurisdictionNames = [
  { id: 1, title: 'Brisbane' },
  { id: 2, title: 'Cairns' },
  { id: 3, title: 'Townsville' },
];


class AuthorityView extends React.Component {
  state = { emailKey : null, 
            phoneKey : null, 
            stackId : null, 
            myAddress : null,
            emailAddr : "",
            phone : "",
            showContactForm: false,
            jurisdictionsKey : null,
            jurisdictionNames : [],
            currentJurisdiction : "",
          };

  submitContactDetails = () => {
    this.submitDetailsToLedger(this.state.myAddress, this.state.emailAddr, this.state.phone);
    this.setState( { showContactForm: false} )
  };

  submitDetailsToLedger = (addr, email, phone) => {
    const { drizzle, drizzleState} =  this.props;
    const contract = drizzle.contracts.AuthorityRegistry;

    const stackId = contract.methods["setContactDetailsForAuthority"].cacheSend(
      addr, phone, email, {from: drizzleState.accounts[0]
    });

    // save the `stackId` for later reference
    this.setState({ stackId });
  };

  generateJurisdiction = () => {
    console.log('test');

  };

  setCurrentJurisdiction = (title) => {
    this.setState( { currentJurisdiction : title });
  };

  displayAddress = () => {
    return <View style={this.props.styles.bodySection}>
            <Text style={this.props.styles.subHeading}> Authority address: </Text>
            <Text numberOfLines={1} style={this.props.styles.bodyText}> {this.state.myAddress} </Text>
          </View>
  }

  displayContactDetails = () => {
    const { AuthorityRegistry } = this.props.drizzleState.contracts;

    const email = AuthorityRegistry.getContactEmailForAuthority[this.state.emailKey];
    const phone = AuthorityRegistry.getContactPhoneForAuthority[this.state.phoneKey];

    return (
      <View style={this.props.styles.bodySection}>
        <View style={this.props.styles.bodySectionButtonRow}>
          <View>
            <Text style={this.props.styles.subHeading}> On-Ledger Email: </Text>
            <Text style={this.props.styles.bodyText}> {email && email.value} </Text>
            <View style={{marginBottom: 5}}></View>
            <Text style={this.props.styles.subHeading}> On-Ledger Phone: </Text>
            <Text style={this.props.styles.bodyText}> {phone && phone.value} </Text>
            <View style={{marginBottom: 5}}></View>
          </View> 
          <View style={{justifyContent : 'center'}}>
            <TouchableOpacity onPress={ () => { this.setState( {showContactForm : true} )}}
                style={[this.props.styles.buttonStyle, { backgroundColor : '#4B0082'}]}> 
              <Text style={this.props.styles.buttonText}>Update</Text>  
            </TouchableOpacity>
            <Text style={{textAlign: "center", justifyContent: "center"}}>{this.getTxStatus()}</Text>
          </View>
        </View>
      </View>
    )
  };

  displayListItem = (text, onSelect) => {
    return (
      <TouchableOpacity
        onPress={() => onSelect(text)}
        style={this.props.styles.listItem}
      >
        <Text style={this.props.styles.listText}>{text}</Text>
      </TouchableOpacity>
    );  
  };

  displayJurisdictions = () => {
    const { AuthorityRegistry } = this.props.drizzleState.contracts;

    //const jurisdictionList = AuthorityRegistry.getJurisdictionNames[this.state.jurisdictionsKey];
    
    // <FlatList data={}

    return (
      <View style={this.props.styles.bodySection}>
        <View style={this.props.styles.bodySectionButtonRow}>
          <View>
            <Text style={this.props.styles.subHeading}> Jurisdiction List: </Text>
              <View style={this.props.styles.list}>
                <FlatList
                  keyExtractor={(item) => item.id}
                  data={mockJurisdictionNames}
                  renderItem={({ item }) => (
                    this.displayListItem(item.title, this.setCurrentJurisdiction)
                  )}>
                </FlatList>
              </View>
          </View>
          <View style={{justifyContent : 'center'}}>
            <TouchableOpacity onPress={this.generateJurisdiction}
                style={[this.props.styles.buttonStyle, { backgroundColor : '#4B0082'}]}> 
              <Text style={this.props.styles.buttonText}>Add</Text>  
            </TouchableOpacity>
            <Text style={{textAlign: "center", justifyContent: "center"}}>{this.getTxStatus()}</Text>
          </View>
        </View>
      </View>
    )
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
  

  displayModal = () => {
    return (
      <Modal transparent={true} visible={this.state.showContactForm} onRequestClose={() => { this.setState( { showContactForm: false})}}>
        <View style={{backgroundColor:"#0f0f0f", flex: 1}}>
          <View style={{backgroundColor:"#ffffff", margin: 50, padding: 40, borderRadius: 10, flex: 1}}>
            <Text style={[this.props.styles.title, {marginBottom: 20}]}> Update Contact Details </Text>
            <Text style={this.props.styles.subHeading}> On-Ledger Email: </Text>
            <TextInput
              style={{ height: 40, borderColor: "gray", borderWidth: 1 }}
              onChangeText={emailAddr => this.setState({ emailAddr })}
              value={this.state.emailAdr}
              placeholder="Enter email address"
            />
            <View style={{marginBottom: 20}}></View>
            <Text style={this.props.styles.subHeading}> On-Ledger Phone: </Text>
            <TextInput
              style={{ height: 40, borderColor: "gray", borderWidth: 1 }}
              onChangeText={phone => this.setState({ phone })}
              value={this.state.phone}
              placeholder="Enter phone number"
            />
            <View style={{marginBottom: 20}}></View>
            <Button title="Submit" color="#4B0082" onPress={this.submitContactDetails} />
          </View>
        </View>

      </Modal>
    )};
  
  componentDidMount() {
    const contract = this.props.drizzle.contracts.AuthorityRegistry;

    //get the address from drizzleState
    //authority modelled as address 0
    const myAddress = this.props.drizzleState.accounts[0];
    this.setState({ myAddress });

    const emailKey = contract.methods.getContactEmailForAuthority.cacheCall(myAddress);
    this.setState({ emailKey });

    const phoneKey = contract.methods.getContactPhoneForAuthority.cacheCall(myAddress);
    this.setState({ phoneKey });

    const jurisdictionsKey = contract.methods.getJurisdictionNames.cacheCall();
    this.setState( { jurisdictionsKey });
  }


  render() {
    return (
      <View>
        {this.displayModal()}
        <View style={this.props.styles.titleWrapper}>
          <Text style={[this.props.styles.title, { color : '#4B0082'}]}> Authority View </Text>
        </View>
        <View style={this.props.styles.bodyWrapper}>
          {this.displayAddress()}          
          {this.displayContactDetails()}
          {this.displayJurisdictions()}
  
        </View>
      </View>
    );
  }
}




export default AuthorityView;
