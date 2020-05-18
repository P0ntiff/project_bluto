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
  state = { stackId : null, 
            emailKey : null, 
            phoneKey : null, 
            jurisdictionKey : null,
            myAddress : null,
            newEmail : "",
            newPhone : "",
            newJurisdiction: "",
            showContactForm: false,
            showJurisdictionForm: false,
            addedJurisdictions : [],
            currentJurisdiction : "",
          };

  submitContactDetailsToLedger = () => {
    const contract = this.props.drizzle.contracts.AuthorityRegistry;
    const stackId = contract.methods.setContactDetailsForAuthority.cacheSend(
                      this.state.myAddress, this.state.newPhone, this.state.newEmail, 
                      {from: this.state.myAddress});
    this.setState( { showContactForm: false} )
    this.setState( { stackId } );
  };

  submitNewJurisdictionToLedger = () => {
    //setup object to cache locally
    const id = (this.state.addedJurisdictions.length + 1).toString();
    const jdiction = {id: id, title: this.state.newJurisdiction};
    // add on ledger
    const contract = this.props.drizzle.contracts.AuthorityRegistry;
    const stackId = contract.methods.addJurisdiction.cacheSend(
                      this.state.newJurisdiction, this.state.myAddress, 
                      {from: this.state.myAddress, gas: 1000000});
    //update state
    this.setState( { addedJurisdictions : this.state.addedJurisdictions.concat(jdiction) }, this._saveToLocalCache);
    this.setCurrentJurisdiction(this.state.newJurisdiction);
    this.setState( { showJurisdictionForm: false} );
    this.setState( { stackId } );
  };

  setCurrentJurisdiction = (title) => {
    this.setState( { currentJurisdiction : title });
  };

  _saveToLocalCache = async () => {
    try {
      await AsyncStorage.setItem('addedJurisdictions', JSON.stringify(this.state.addedJurisdictions));
      
    } catch (error) {
      // error saving data
      alert(error.message);
    }
  };

  _readFromLocalCache = async () => {
    try {
      const value = await AsyncStorage.getItem('addedJurisdictions');
      if (value !== null) {
        this.setState ( { addedJurisdictions : JSON.parse(value) } );
        this.setState ( {currentJurisdiction : value[0].title} );
      }
    } catch (error) {
      // error saving data
      alert(error.message);
    }
  }

  displayAddress = () => {
    return <View style={this.props.styles.bodySection}>
            <Text style={this.props.styles.subHeading}> Authority address: </Text>
            <Text numberOfLines={1} style={this.props.styles.bodyText}> {this.state.myAddress} </Text>
          </View>
  }

  displayCurrentJurisdiction = () => {
    return <View style={this.props.styles.bodySection}>
            <Text style={this.props.styles.subHeading}> Current Jurisdiction: </Text>
            <Text numberOfLines={1} style={this.props.styles.bodyText}> {this.state.currentJurisdiction} </Text>
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

  displayJurisdictions = () => {
    const { AuthorityRegistry } = this.props.drizzleState.contracts;

    // if (this.state.addedJurisdictions.length == 0) {
    //   return ( 
    //     <View style={this.props.styles.bodySection}>
    //         <View style={this.props.styles.bodySectionButtonRow}>
    //           <View>
    //             <Text style={this.props.styles.subHeading}> Jurisdiction List: </Text>
    //             <Text style={this.props.styles.bodyText}> No jurisdictions added.</Text> 
    //           </View>
    //         </View>
    //     </View>
    //   );
    // }
    return (
      <View style={this.props.styles.bodySection}>
        <View style={this.props.styles.bodySectionButtonRow}>
          <View>
            <Text style={this.props.styles.subHeading}> Jurisdiction List: </Text>
              <View style={this.props.styles.listBox}>
                <FlatList
                  data={this.state.addedJurisdictions}
                  renderItem={({ item }) => (
                    this.displayListItem(item.title, this.setCurrentJurisdiction)
                  )}
                  keyExtractor={(item, index) => item.id}
                  >
                </FlatList>
              </View>
          </View>
          <View style={{justifyContent : 'center'}}>
            <TouchableOpacity onPress={ () => { this.setState( {showJurisdictionForm : true} )}}
                style={[this.props.styles.buttonStyle, { backgroundColor : '#4B0082'}]}> 
              <Text style={this.props.styles.buttonText}>Add Jurisdiction</Text>  
            </TouchableOpacity>
            <TouchableOpacity onPress={ () => { this.setState( {addedJurisdictions : []}, this._saveToLocalCache)}}
                style={[this.props.styles.buttonStyle, { marginTop: 5, backgroundColor : '#4B0082'}]}> 
              <Text style={this.props.styles.buttonText}>Clear</Text>  
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
  
  displayContactForm = () => {
    return (
      <Modal transparent={true} visible={this.state.showContactForm} onRequestClose={() => { this.setState( { showContactForm: false})}}>
        <View style={this.props.styles.modalBackground}>
          <View style={this.props.styles.modalInnerView}>
            <Text style={this.props.styles.modalTitle}> Update Contact Details </Text>
            <Text style={this.props.styles.subHeading}> On-Ledger Email: </Text>
            <TextInput
              style={this.props.styles.modalForm}
              onChangeText={newEmail => this.setState({ newEmail })}
              value={this.state.emailAdr}
              placeholder="Enter email address"
            />
            <Text style={this.props.styles.subHeading}> On-Ledger Phone: </Text>
            <TextInput
              style={this.props.styles.modalForm}
              onChangeText={newPhone => this.setState({ newPhone })}
              value={this.state.newPhone}
              placeholder="Enter phone number"
            />
            <Button title="Submit" color="#4B0082" onPress={this.submitContactDetailsToLedger} />
          </View>
        </View>

      </Modal>
    )};

  displayJurisdictionForm = () => {
    return (
      <Modal transparent={true} visible={this.state.showJurisdictionForm} onRequestClose={() => { this.setState( { showJurisdictionForm: false})}}>
        <View style={this.props.styles.modalBackground}>
          <View style={this.props.styles.modalInnerView}>
            <Text style={this.props.styles.modalTitle}> Enter New Jurisdiction </Text>
            <TextInput
              style={this.props.styles.modalForm}
              onChangeText={newJurisdiction => this.setState({ newJurisdiction })}
              value={this.state.emailAdr}
              placeholder="Enter jurisdiction"
            />
            <Button title="Submit" color="#4B0082" onPress={this.submitNewJurisdictionToLedger} />
          </View>
        </View>

      </Modal>
  )};
  
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

  componentDidMount() {
    // get local state cache
    this._readFromLocalCache();

    const contract = this.props.drizzle.contracts.AuthorityRegistry;

    //authority is modelled as address 0
    const myAddress = this.props.drizzleState.accounts[0];
    this.setState({ myAddress });

    const emailKey = contract.methods.getContactEmailForAuthority.cacheCall(myAddress);
    this.setState({ emailKey });

    const phoneKey = contract.methods.getContactPhoneForAuthority.cacheCall(myAddress);
    this.setState({ phoneKey });

    const jurisdictionKey = contract.methods.getJurisdictionForAuthority.cacheCall(myAddress);
    this.setState( { jurisdictionKey });

  }

  render() {
    return (
      <View>
        {this.displayContactForm()}
        {this.displayJurisdictionForm()}
        <View style={this.props.styles.titleWrapper}>
          <Text style={[this.props.styles.title, { color : '#4B0082'}]}> Authority View </Text>
        </View>
        <View style={this.props.styles.bodyWrapper}>
          {this.displayAddress()}          
          {this.displayContactDetails()}
          {this.displayJurisdictions()}
          {this.displayCurrentJurisdiction()}
        </View>
      </View>
    );
  }
}




export default AuthorityView;
