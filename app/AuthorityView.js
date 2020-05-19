import React from "react";
import { Text, View, Button, TextInput, 
          TouchableOpacity, Modal, FlatList,
          AsyncStorage } from "react-native";

// const mockJurisdictionNames = [
//   { id: '1', title: 'Brisbane' },
//   { id: '2', title: 'Cairns' },
//   { id: '3', title: 'Townsville' },
// ];

const mockInboxMessage = {
    name: "Anonymous",
    pdf: "Positive Result.pdf",
    eidListDisplay: [
      {id: '1', title: '31d152228b'},
      {id: '2', title: '438ab85cdf'},
      {id: '3', title: '3e9aa49aec'},
      {id: '4', title: 'e789b60281'},
    ],
    eidListPublish: [
        '31d152228b',
        '438ab85cdf',
        '3e9aa49aec',
        'e789b60281',
    ]
    
}


class AuthorityView extends React.Component {
  state = { stackId : null, 
            emailKey : null, 
            phoneKey : null, 
            jurisdictionKey : null,
            lastPositiveEidKey : null,
            myAddress : null,
            newEmail : "",
            newPhone : "",
            newJurisdiction: "",
            showContactForm: false,
            showJurisdictionForm: false,
            showReviewMessage: false,
            messageToReview: true,
            inboxMessage: null,
            addedJurisdictions : [],
            // currentJurisdiction: "",
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
    // submit to AuthorityRegistry
    const authRegContract = this.props.drizzle.contracts.AuthorityRegistry;
    const stackId = authRegContract.methods.addJurisdiction.cacheSend(
                      this.state.newJurisdiction, this.state.myAddress, 
                      {from: this.state.myAddress, gas: 1000000});
    // setup object to cache locally
    const id = (this.state.addedJurisdictions.length + 1).toString();
    const jdiction = {id: id, title: this.state.newJurisdiction};
    // cache and update local state
    this.setState( { addedJurisdictions : this.state.addedJurisdictions.concat(jdiction) }, this._saveToLocalCache);
    this.setState( { showJurisdictionForm: false} );
    this.setState( { stackId } );
  };

  submitCurrentJurisdictionToLedger = (title) => {
    const authRegContract = this.props.drizzle.contracts.AuthorityRegistry;
    const stackId = authRegContract.methods.setCurrentJurisdiction.cacheSend(
                      this.state.myAddress, title, 
                      {from: this.state.myAddress});
    this.setState( { stackId } );
  };

  publishNewEncounterList = () => {
    // get the current jurisdiction
    const { AuthorityRegistry } = this.props.drizzleState.contracts;
    const currentJurisdiction = AuthorityRegistry.getCurrentJurisdiction[this.state.jurisdictionKey];
    // get EID list from inbox
    const eidList = this.state.inboxMessage.eidListPublish;
    console.log(eidList[0]);
    console.log(currentJurisdiction);
    // send to result feed (publish)
    const rfContract = this.props.drizzle.contracts.ResultFeed;
    const stackId = rfContract.methods.publishExposureNotification.cacheSend(
                      eidList[0], currentJurisdiction.value, 
                      {from: this.state.myAddress, gas: 1000000});
    this.setState( { showReviewMessage: false} );
    this.setState( { stackId } );

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
      const addedList = await AsyncStorage.getItem('addedJurisdictions');
      if (addedList !== null) {
        this.setState ( { addedJurisdictions : JSON.parse(addedList) } );
      }
      //const newMessage = await AsyncStorage.getItem('newMessage');
      const newMessage = mockInboxMessage;
      if (newMessage !== null) {
        //this.setState ( { newMessage : JSON.parse(newMessage)})
        this.setState ( { inboxMessage : newMessage} )
        this.setState ( { messageToReview : true } )

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
    return (
      <View style={this.props.styles.bodySection}>
        <Text style={this.props.styles.subHeading}> Jurisdiction List: </Text>
        <View style={this.props.styles.bodySectionButtonRow}>
          <View>
            <View style={this.props.styles.listBox}>
              <FlatList
                data={this.state.addedJurisdictions}
                renderItem={({ item }) => (
                  this.displayListItem(item.title, this.submitCurrentJurisdictionToLedger, this.props.styles.listItem)
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
            {this.state.addedJurisdictions.length != 0 ? (
              <TouchableOpacity onPress={ () => { this.setState( {addedJurisdictions : []}, this._saveToLocalCache)}}
                  style={[this.props.styles.buttonStyle, { marginTop: 5, backgroundColor : '#4B0082'}]}> 
                <Text style={this.props.styles.buttonText}>Clear</Text>  
              </TouchableOpacity>
            ) : (
                 null 
            )}
            <Text style={{textAlign: "center", justifyContent: "center"}}>{this.getTxStatus()}</Text>
          </View>
        </View>
      </View>
    )
  };

  displayInbox = () => {
    const { AuthorityRegistry } = this.props.drizzleState.contracts;
    const currentJurisdiction = AuthorityRegistry.getCurrentJurisdiction[this.state.jurisdictionKey];

    return (
      <View style={this.props.styles.bodySection}>
        <Text style={this.props.styles.subHeading}> Inbox for {currentJurisdiction && currentJurisdiction.value}: </Text>
        {this.state.messageToReview ? (
          <View style={this.props.styles.bodySectionButtonRow}>
            <View style={this.props.styles.listBox}>
              <View style={[this.props.styles.listItem, { width: 140 }]}> 
                <Text style={this.props.styles.listText}>From: {this.state.inboxMessage ? this.state.inboxMessage.name : null}</Text>
              </View>
            </View>
            <View style={{justifyContent : 'center'}}>
              <TouchableOpacity onPress={ () => { this.setState( { showReviewMessage : true} )}}
                    style={[this.props.styles.buttonStyle, { backgroundColor : '#4B0082'}]}> 
                  <Text style={this.props.styles.buttonText}>Review Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={this.props.styles.bodyText}>No new messages.</Text>
        )}
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

  displayReviewMessage = () => {
    return (
      <Modal transparent={true} visible={this.state.showReviewMessage} onRequestClose={() => { this.setState( { showReviewMessage: false})}}>
        <View style={this.props.styles.modalBackground}>
          <View style={this.props.styles.modalInnerView}>
            <Text style={this.props.styles.modalTitle}> Review Message </Text>
            <Text style={this.props.styles.subHeading}> From:  </Text>
            <Text style={this.props.styles.bodyText}> {this.state.inboxMessage ? this.state.inboxMessage.name : null} </Text>
            <View style={{marginBottom: 15}}></View>
            <Text style={this.props.styles.subHeading}> PDF Attachment:  </Text>
            <Text style={this.props.styles.bodyText}> {this.state.inboxMessage ? this.state.inboxMessage.pdf : null} </Text>
            <View style={{marginBottom: 15}}></View>
            <Text style={this.props.styles.subHeading}> EID List:  </Text>
            <View style={this.props.styles.listBox}>
              {this.state.inboxMessage ? (
                <FlatList
                  data={this.state.inboxMessage.eidListDisplay}
                  renderItem={({ item }) => (
                    this.displayListItem(item.title, null, this.props.styles.modalListItem)
                  )}
                  keyExtractor={(item, index) => item.id}
                  >
                </FlatList>
              ) : ( 
                null 
              )}
            </View>
            <View style={{marginBottom: 30}}></View>
            <Button title="Publish" color="#4B0082" onPress={this.publishNewEncounterList} />
          </View>
        </View>

      </Modal>
  )};
  
  displayListItem = (text, onSelect, itemStyle) => {
    return (
      <TouchableOpacity
        onPress={() => onSelect(text)}
        style={itemStyle}
      >
        <Text style={this.props.styles.listText}>{text}</Text>
      </TouchableOpacity>
    );  
  };

  componentDidMount() {
    // get local state cache
    this._readFromLocalCache();

    const authRegContract = this.props.drizzle.contracts.AuthorityRegistry;
    const rfContract = this.props.drizzle.contracts.ResultFeed;

    // authority registry on-chain state
    const myAddress = this.props.drizzleState.accounts[0];    //authority is modelled as address 0
    this.setState({ myAddress });

    const emailKey = authRegContract.methods.getContactEmailForAuthority.cacheCall(myAddress);
    this.setState({ emailKey });

    const phoneKey = authRegContract.methods.getContactPhoneForAuthority.cacheCall(myAddress);
    this.setState({ phoneKey });

    const jurisdictionKey = authRegContract.methods.getCurrentJurisdiction.cacheCall(myAddress);
    this.setState({ jurisdictionKey });

    // result feed on-chain state
    const lastPositiveEidKey = rfContract.methods.getLastPositiveEID.cacheCall();
    this.setState( { lastPositiveEidKey });    

  }

  render() {
    return (
      <View>
        {this.displayContactForm()}
        {this.displayJurisdictionForm()}
        {this.displayReviewMessage()}
        <View style={this.props.styles.titleWrapper}>
          <Text style={[this.props.styles.title, { color : '#4B0082'}]}> Authority View </Text>
        </View>
        <View style={this.props.styles.bodyWrapper}>
          {this.displayAddress()}          
          {this.displayContactDetails()}
          {this.displayJurisdictions()}
          {this.displayInbox()}
        </View>
      </View>
    );
  }
}




export default AuthorityView;
