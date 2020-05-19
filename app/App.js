/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import { Platform, Button, StyleSheet, Text, View } from "react-native";
import AuthorityView from "./AuthorityView";
import UserView from "./UserView";

type Props = {};
export default class App extends Component<Props> {
  state = { loading: true, drizzleState: null, authViewEnabled: false };

  componentDidMount() {
    const { drizzle } = this.props;

    this.unsubscribe = drizzle.store.subscribe(() => {
      const drizzleState = drizzle.store.getState();

      if (drizzleState.drizzleStatus.initialized) {
        this.setState({ loading: false, drizzleState });
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  getButtonLabel = () => {
    if (this.state.authViewEnabled) {
      return `User`;
    } else {
      return `Auth`;
    }
  };

  getButtonColour = () => {
    if (this.state.authViewEnabled) {
      return "#008000";
    } else {
      return "#4B0082";
    }
  };

  toggleView = () => {
    this.setState({ authViewEnabled: !this.state.authViewEnabled });
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.mainView}>
          {this.state.loading ? (
            <Text>Loading...</Text>
          ) : (
            <View>
              {this.state.authViewEnabled ? (
                <AuthorityView
                  drizzle={this.props.drizzle}
                  drizzleState={this.state.drizzleState}
                  styles={styles}
                />
              ) : (
                <UserView
                  drizzle={this.props.drizzle}
                  drizzleState={this.state.drizzleState}
                  styles={styles}
                />
              )}
            </View>
          )}
        </View>
        <Button
          title={this.getButtonLabel()}
          onPress={this.toggleView}
          style={styles.floatingButton}
          color={this.getButtonColour()}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  },
  mainView: {
    flex: 5,
  },
  floatingButton: {
    flex: 1,
    bottom: 35,
    position: "absolute",
    padding: 10,
    borderRadius: 5,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center'
  },
  titleWrapper: {
    justifyContent: 'center',
    height: 50,
    //backgroundColor: 'rgba(52, 52, 52, 0.2)'
  },
  bodyWrapper: {
    height: 400,
    //backgroundColor: 'rgba(52, 52, 52, 0.4)',
  },
  bodySection: {
    marginBottom: 25,
    marginLeft: 20,
    marginRight: 20
  },
  subHeading: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  bodyText: {
    paddingLeft: 10,
  },
  buttonStyle: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    justifyContent: 'center',
    borderRadius: 5,
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  bodySectionButtonRow: {
    marginTop: 5,
    flexDirection : "row", 
    justifyContent: "space-between", 
  },
  listBox: {
    marginLeft: 10,
  },
  listItem: {
    flex: 1,
    flexDirection: 'row',
    padding: 8,
    width: 120,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.8,
    borderColor: '#000000'
  },
  listText: {
    paddingLeft: 5,
  },
  modalBackground: {
    backgroundColor:"#0f0f0f",
    flex: 1
  },
  modalInnerView : {
    backgroundColor:"#ffffff", 
    margin: 50, 
    padding: 40, 
    borderRadius: 10, 
    flex: 1},
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20
  },
  modalForm: {
    height: 40, 
    borderColor: "gray", 
    borderWidth: 1,
    marginBottom: 20
  },
  modalListItem: {
    flex: 1,
    flexDirection: 'row',
    padding: 8,
    width: 150,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.8,
    borderColor: '#000000'
  },

});
