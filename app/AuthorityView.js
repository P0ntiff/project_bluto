import React from "react";
import { Text, View, Button, TextInput, TouchableOpacity, Modal } from "react-native";

class AuthorityView extends React.Component {
  state = { emailKey: null, 
            phoneKey: null, 
            stackId: null, 
            myAddress: null,
            emailAddr: "",
            phone: "",
            showModal: false };

  submitContactDetails = () => {
    this.submitDetailsToLedger(this.state.myAddress, this.state.emailAddr, this.state.phone);
    this.setState( { showModal: false} )
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

    if (!email) {
      //
    }
    return (
      <View style={this.props.styles.bodySection}>
        <View style={{flexDirection : "row", justifyContent: "space-between", marginRight: 15}}>
          <View>
            <Text style={this.props.styles.subHeading}> On-Ledger Email: </Text>
            <Text style={this.props.styles.bodyText}> {email && email.value} </Text>
            <View style={{marginBottom: 5}}></View>
            <Text style={this.props.styles.subHeading}> On-Ledger Phone: </Text>
            <Text style={this.props.styles.bodyText}> {phone && phone.value} </Text>
            <View style={{marginBottom: 5}}></View>
          </View> 
          <View style={{justifyContent : 'center'}}>
            <TouchableOpacity onPress={ () => { this.setState( {showModal:true} )}}
                style={[this.props.styles.buttonStyle, { backgroundColor : '#4B0082'}]}> 
              <Text style={this.props.styles.buttonText}>Update</Text>  
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )};

  displayModal = () => {
    return (
      <Modal transparent={true} visible={this.state.showModal} onRequestClose={() => { this.setState( { showModal: false})}}>
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

    emailKey = contract.methods.getContactEmailForAuthority.cacheCall(myAddress);
    this.setState({ emailKey });

    phoneKey = contract.methods.getContactPhoneForAuthority.cacheCall(myAddress);
    this.setState({ phoneKey });
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
  
        </View>
      </View>
    );
  }
}




export default AuthorityView;
