import React from "react";
import { Text, View, Button, TextInput, StyleSheet } from "react-native";


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


generateRandomEncounter = () => {
    return {
        eid: mockEIDS[Math.floor(Math.random() * mockEIDS.length)],
        identity: mockAddresses[Math.floor(Math.random() * mockAddresses.length)],
        location: mockLocations[Math.floor(Math.random() * mockLocations.length)],
        exposure: mockTimes[Math.floor(Math.random() * mockTimes.length)]
    }
};


class UserView extends React.Component {
  state = { dataKey: null, 
            stackId: null, 
            text: "",
            encounters: [],
            lastEncounter: ""};

  clearEncounterList = () => {
    this.setState( { encounters: [] });
  }

  generateEncounter = () => {
    const newEncounter = generateRandomEncounter();
    this.setState( {
      lastEncounter : newEncounter.eid,
      encounters: this.state.encounters.concat(newEncounter)
    });
  }
            
  submit = () => {
    this.generateEncounter();
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

  displayContractState = () => {

    return <Text> Random Encounter: {this.state.lastEncounter} </Text>
   // return <Text>Some stored string: {myString && myString.value}</Text>;
  }

  componentDidMount() {
    //

  }


  render() {
    return (
      <View>
        <View style={this.props.styles.titleWrapper}>
          <Text style={[this.props.styles.title, { color : '#008000'}]}> User View </Text>
        </View>
        <View style={this.props.styles.bodyWrapper}>
          {this.displayContractState()}
          <TextInput
            style={{ height: 40, borderColor: "gray", borderWidth: 1 }}
            onChangeText={text => this.setState({ text })}
            value={this.state.text}
            placeholder="Enter some text"
          />
          <Button title="Submit" onPress={this.submit} color='#008000' />
          <Text>{this.getTxStatus()}</Text>
        </View>
      </View>
    );
  }
}





export default UserView;
