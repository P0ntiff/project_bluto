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
  state = { loading: true, drizzleState: null, authViewEnabled: true };

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
    marginBottom: 20,
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
    height: 40,
    width: 100,
    justifyContent: 'center',
    borderRadius: 5,
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }

});
