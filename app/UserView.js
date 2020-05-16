import React from "react";
import { Text, View, Button, TextInput, StyleSheet } from "react-native";

class UserView extends React.Component {
  state = { dataKey: null, stackId: null, text: "" };

  submit = () => {
    this.setValue(this.state.text);
  };

  setValue = value => {
    const { drizzle, drizzleState } = this.props;
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
      return `Transaction status: ${transactions[txHash].status}`;

    return null;
  };

  displayContractState = () => {
    // get the contract state from drizzleState
    const { MyStringStore } = this.props.drizzleState.contracts;

    // using the saved `dataKey`, get the variable we're interested in
    const myString = MyStringStore.myString[this.state.dataKey];

    // if it exists, then we display its value
    return <Text>Some stored string: {myString && myString.value}</Text>;
  }

  componentDidMount() {
    const { drizzle, drizleState } = this.props;
    const contract = drizzle.contracts.MyStringStore;

    // let drizzle know we want to watch the `myString` method
    const dataKey = contract.methods["myString"].cacheCall();

    // save the `dataKey` to local component state for later reference
    this.setState({ dataKey });
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
