# Project Bluto

### Decentralised contact tracing dApp based on Ethereum smart contracts.

(Fork of [Truffle/React-Native box](https://www.trufflesuite.com/boxes/drizzle-react-native))

## Prerequisites

`npm install -g truffle`

`npm install -g ganache-cli`

## Key Commands

Installing dependencies (first-time setup): `yarn install`

Running the dApp: `react-native start` or `npx react-native start`

Compile and migrate (deploy) contracts: `truffle compile && truffle migrate`

Android: Reverse ganache ports: `adb reverse tcp:8545 tcp:8545` (this allows the app to interact with the ganache chain)

Android: Run dApp: `react-native run-android` or `npx react-native run-android` (requires environment setup, see below)

Test contracts: `truffle test`

Test dapp: `yarn test`

iOS: Run dapp (simulator only): `react-native run-ios`

## Other

Original repo instructions [here](https://www.trufflesuite.com/boxes/drizzle-react-native)

Instructions for running on Android emulator / device [here](https://reactnative.dev/docs/running-on-device)

Good resource for setting up the Android environment under the "React Native CLI Quickstart" tab [here](https://reactnative.dev/docs/environment-setup).
