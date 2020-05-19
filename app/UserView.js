import React from "react";
import { Text, View, Button, TextInput, 
  TouchableOpacity, Modal, FlatList,
  AsyncStorage } from "react-native";

const mockEIDS = [
  '31d152228b',
  '438ab85cdf',
  '3e9aa49aec',
  'e789b60281',
  '6efd79490a',
  '42f7d23da2',
  '475db77fff',
  'ee9227a558',
  'c980e9f873',
  '175f52d48a',
  '49917193b9',
  '77d9047b42',
  '41a6abe2d9',
  '94fa4be852',
  '4b5d2c6840'
]

const mockLocations = [
  'Fortitude Valley, QLD',
  'Brisbane CBD, QLD',
  'South Bank, QLD',
  'St Lucia, QLD',
  'Toowong, QLD'
]

const mockAddresses = [
  '0xd0a4cf8c6cd95646',
  '0x0e95d7bb93c21fba',
  '0x702deb6079df03b7',
  '0x6772540417b69e55',
  '0x889de9bf2b19a560',
  '0xd6d78fff37487cc7',
  '0x54e91d38c224fcdd',
  '0x584651caf9e6c238',
  '0x055424d2a7a1454b',
  '0x3c172d2355ab10fc',
  '0xc33ef13c4d1aa936',
  '0x849fca751a008fb7'
]

const mockTimes = [
  '5 minutes',
  '6 minutes',
  '7 minutes',
  '8 minutes',
  '9 minutes',
  '10 minutes'
]

const mockDates = [
  '08-05-2020 16:40',
  '09-05-2020 08:40',
  '10-05-2020 09:40',
  '11-05-2020 13:40',
  '12-05-2020 12:40',
  '13-05-2020 14:40',
]


generateRandomEncounter = () => {
    return {
        eid: mockEIDS[Math.floor(Math.random() * mockEIDS.length)],
        identity: mockAddresses[Math.floor(Math.random() * mockAddresses.length)],
        location: mockLocations[Math.floor(Math.random() * mockLocations.length)],
        date: mockDates[Math.floor(Math.random() * mockDates.length)],
        exposure: mockTimes[Math.floor(Math.random() * mockTimes.length)]
    }
};


class UserView extends React.Component {
  state = { stackId : null, 
            myAddress : null,
            authAddress : null,
            nameKey : null,
            emailKey : null, 
            phoneKey : null, 
            jurisdictionKey : null,
            lastPositiveEidKey : null,
            showEmailForm : false,
            showEncounter : false,
            encounterInView : null,
            encounters: [],
            pdfTitle: "",
            lastEncounter: ""
          };

  clearEncounterList = () => {
    this.setState( { encounters: [] }, this._saveToLocalCache);
  };

  generateEncounter = () => {
    const newEncounter = generateRandomEncounter();
    this.setState( {
      lastEncounter : newEncounter.eid,
      encounters: this.state.encounters.concat(newEncounter)
    }, this._saveToLocalCache);
  };

  _saveToLocalCache = async () => {
    try {
      await AsyncStorage.setItem('encounters', JSON.stringify(this.state.encounters));
    } catch (error) {
      // error saving data
      alert(error.message);
    }
  };

  _readFromLocalCache = async () => {
    try {
      const encounters = await AsyncStorage.getItem('encounters');
      if (encounters !== null) {
        this.setState ( { encounters : JSON.parse(encounters) } );
      }
    } catch (error) {
      // error saving data
      alert(error.message);
    }
  }
  
  displayAddress = () => {
    return <View style={this.props.styles.bodySection}>
            <Text style={this.props.styles.subHeading}> User address: </Text>
            <Text numberOfLines={1} style={this.props.styles.bodyText}> {this.state.myAddress} </Text>
          </View>
  };
 
  displayLocalJurisdiction = () => {
    const { AuthorityRegistry } = this.props.drizzleState.contracts;
    const currentJurisdiction = AuthorityRegistry.getCurrentJurisdiction[this.state.jurisdictionKey];

    return <View style={this.props.styles.bodySection}>
            <Text style={this.props.styles.subHeading}> Local Jurisdiction: </Text>
            <Text numberOfLines={1} style={this.props.styles.bodyText}> {currentJurisdiction && currentJurisdiction.value} </Text>
          </View>
  };
 
  displayLocalAuthority = () => {
    const { AuthorityRegistry } = this.props.drizzleState.contracts;
    const localAuthName = AuthorityRegistry.getNameForAuthority[this.state.nameKey];

    return <View style={this.props.styles.bodySection}>
            <View style={{flexDirection: 'row'}}>
            <View style={{width: 150}}>
                <Text style={this.props.styles.subHeading}> Local Authority: </Text>
                <Text numberOfLines={1} style={this.props.styles.bodyText}> {localAuthName && localAuthName.value} </Text>
              </View>
              <View style={{width: 150}}>
                <Text style={this.props.styles.subHeading}> Authority Address: </Text>
                <Text numberOfLines={1} style={this.props.styles.bodyText}> {this.state.authAddress} </Text>
              </View>
            </View>
          </View>
  };

  displayContactDetails = () => {
    const { AuthorityRegistry } = this.props.drizzleState.contracts;
    const email = AuthorityRegistry.getContactEmailForAuthority[this.state.emailKey];
    const phone = AuthorityRegistry.getContactPhoneForAuthority[this.state.phoneKey];
    const localAuthName = AuthorityRegistry.getNameForAuthority[this.state.nameKey];

    return (
      <View style={this.props.styles.bodySection}>
        <View style={this.props.styles.bodySectionButtonRow}>
          <View>
            <Text style={this.props.styles.subHeading}> Contact {localAuthName && localAuthName.value}: </Text>
            <Text style={this.props.styles.bodyText}> Email:    {email && email.value} </Text>
            <View style={{marginBottom: 5}}></View>
            <Text style={this.props.styles.bodyText}> Phone:    {phone && phone.value} </Text>
          </View> 
          <View style={{justifyContent : 'center', marginTop: 5}}>
            <TouchableOpacity onPress={ () => { this.setState( {showEmailForm : true} )}}
                style={[this.props.styles.buttonStyle, { backgroundColor : '#008000'}]}> 
              <Text style={this.props.styles.buttonText}>Send Result</Text>  
            </TouchableOpacity>
            <Text style={{textAlign: "center", justifyContent: "center"}}>{this.getTxStatus()}</Text>
          </View>
        </View>
      </View>
    )
  };

  displayEmailForm = () => {
    return (
      <Modal transparent={true} visible={this.state.showEmailForm} onRequestClose={() => { this.setState( { showEmailForm: false })}}>
        <View style={this.props.styles.modalBackground}>
          <View style={this.props.styles.modalInnerView}>
            <Text style={this.props.styles.modalTitle}> Submit Test Result </Text>
            <View style={this.props.styles.bodySectionButtonRow}>
              <View>
                <Text style={this.props.styles.subHeading}> PDF: </Text> 
                <Text style={[this.props.styles.bodyText, { fontSize: 12 }]}> {this.state.pdfTitle} </Text> 
              </View>
              { this.state.pdfTitle == "" ? (
                <TouchableOpacity onPress={() => { this.setState( { pdfTitle : "Positive_Result.pdf" } )}}
                style={[this.props.styles.buttonStyle, { backgroundColor : '#008000' }]}> 
                <Text style={this.props.styles.buttonText}>Browse</Text>  
                </TouchableOpacity>
              ) : ( 
                null
              )}
            </View>
            <View style={{marginBottom: 15}}></View>
            <Text style={this.props.styles.subHeading}> EID List:  </Text>
            <View style={this.props.styles.listBox}>
              <FlatList
                  data={this.state.encounters}
                  renderItem={({ item }) => (
                    this.displayEncounterItem(item, this.props.styles.modalListItem)
                  )}
                  keyExtractor={(item, index) => item.eid}
                  >
              </FlatList>
            </View>
            <View style={{marginBottom: 30}}></View>

            <Button title="Submit" color="#008000" onPress={() => { this._saveToLocalCache(); this.setState( { showEmailForm: false })}} />
          </View>
        </View>
      </Modal>
  )};

  displayExposureStatus = () => {
    const { ResultFeed } = this.props.drizzleState.contracts;
    // do something with events (another function?)
    
    return <View style={this.props.styles.bodySection}>
            <Text style={this.props.styles.subHeading}> Exposure Status: </Text>
            <View style={this.props.styles.listBox}>
              <Text style={[this.props.styles.title, { color : '#008000', textAlign: 'left'}]}> Safe </Text>
            </View>
          </View>
  };

  displayEncounterDetails = () => {
    const encounter = this.state.encounterInView;
    return (
      <Modal transparent={true} visible={this.state.showEncounter} onRequestClose={() => { this.setState( { showEncounter: false })}}>
        <View style={this.props.styles.modalBackground}>
          <View style={this.props.styles.modalInnerView}>
            <Text style={this.props.styles.modalTitle}> Encounter Details </Text>
            <Text style={this.props.styles.subHeading}> EID: </Text> 
            <Text style={this.props.styles.bodyText}> {encounter ? encounter.eid : null } </Text>
            <View style={{marginBottom: 15}}></View>
            <Text style={this.props.styles.subHeading}> Date / Time:  </Text>
            <Text style={this.props.styles.bodyText}> {encounter ? encounter.date : null } </Text>
            <View style={{marginBottom: 15}}></View>
            <Text style={this.props.styles.subHeading}> Location: </Text>
            <Text style={this.props.styles.bodyText}> {encounter ? encounter.location : null } </Text>
            <View style={{marginBottom: 15}}></View>
            <Text style={this.props.styles.subHeading}> Identity of counterparty:  </Text>
            <Text style={this.props.styles.bodyText}> {encounter ? encounter.identity : null } </Text>
            <View style={{marginBottom: 15}}></View>
            <Text style={this.props.styles.subHeading}> Exposure:  </Text>
            <Text style={this.props.styles.bodyText}> {encounter ? encounter.exposure : null } </Text>
            <View style={{marginBottom: 30}}></View>

            <Button title="Close" color="#008000" onPress={() => { this.setState( { showEncounter: false })}} />
          </View>
        </View>
      </Modal>
    )};

  displayEncounters = () => {
    return (
      <View style={[this.props.styles.bodySection, { marginBottom : 5 }]}>
        <Text style={this.props.styles.subHeading}> Recent Encounters: </Text>
        <View style={this.props.styles.bodySectionButtonRow}>
          <View>
            <View style={this.props.styles.listBox}>
              <FlatList
                data={this.state.encounters}
                renderItem={({ item }) => (
                  this.displayEncounterItem(item, this.props.styles.modalListItem)
                )}
                keyExtractor={(item, index) => item.eid}
                >
              </FlatList>
            </View>
          </View>
          <View style={{justifyContent : 'center'}}>
            <TouchableOpacity onPress={this.generateEncounter}
                style={[this.props.styles.buttonStyle, { backgroundColor : '#008000'}]}> 
              <Text style={this.props.styles.buttonText}>Generate</Text>  
            </TouchableOpacity>
            {this.state.encounters.length != 0 ? (
              <TouchableOpacity onPress={this.clearEncounterList}
                  style={[this.props.styles.buttonStyle, { marginTop: 5, backgroundColor : '#008000'}]}> 
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

  displayEncounterItem = (encounter, itemStyle) => {
    console.log(encounter);
    if (encounter == null) {
      return null;
    }
    return (
      <TouchableOpacity
        onPress={() => this.setState ( { encounterInView : encounter, showEncounter : true })}
        style={itemStyle}
      >
        <Text style={this.props.styles.listText}>{encounter.eid}</Text>
      </TouchableOpacity>
    );  
  };

  componentDidMount() {
    // get local state cache
    this._readFromLocalCache();
    const authRegContract = this.props.drizzle.contracts.AuthorityRegistry;
    const rfContract = this.props.drizzle.contracts.ResultFeed;

    // take user as second address
    const myAddress = this.props.drizzleState.accounts[1];    //authority is modelled as address 0
    this.setState({ myAddress });

    // take auth address from first key
    const authAddress = this.props.drizzleState.accounts[0];    //authority is modelled as address 0
    this.setState({ authAddress });

    // get name, email, phone, jurisdiction of the authorty
    const nameKey = authRegContract.methods.getNameForAuthority.cacheCall(authAddress);
    this.setState({ nameKey } );
    const emailKey = authRegContract.methods.getContactEmailForAuthority.cacheCall(authAddress);
    this.setState({ emailKey });
    const phoneKey = authRegContract.methods.getContactPhoneForAuthority.cacheCall(authAddress);
    this.setState({ phoneKey });
    const jurisdictionKey = authRegContract.methods.getCurrentJurisdiction.cacheCall(authAddress);
    this.setState({ jurisdictionKey });

    // result feed on-chain state
    const lastPositiveEidKey = rfContract.methods.getLastPositiveEID.cacheCall();
    this.setState( { lastPositiveEidKey });    

  }

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

  render() {
    return (
      <View>
        {this.displayEncounterDetails()}
        {this.displayEmailForm()}
        <View style={this.props.styles.titleWrapper}>
          <Text style={[this.props.styles.title, { color : '#008000'}]}> User View </Text>
        </View>
        <View style={this.props.styles.bodyWrapper}>
          {this.displayAddress()}          
          {this.displayLocalJurisdiction()}
          {this.displayLocalAuthority()}
          {this.displayContactDetails()}
          {this.displayEncounters()}
          {this.displayExposureStatus()}
        </View>
      </View>
    );
  }
}





export default UserView;
