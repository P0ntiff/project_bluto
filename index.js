/** @format */
import "./shims";
import { AppRegistry } from "react-native";
import App from "./app/App";
import { name as appName } from "./app.json";

import React from "react";
import { Drizzle, generateStore } from "drizzle";
import MyStringStore from "./build/contracts/MyStringStore.json";
import AuthorityRegistry from "./build/contracts/AuthorityRegistry.json";
import ResultFeed from "./build/contracts/ResultFeed.json";

const options = {
  contracts: [MyStringStore, AuthorityRegistry, ResultFeed],
  events: {
    ResultFeed: ["PositiveResult"],
  },
};

const drizzleStore = generateStore(options);
const drizzle = new Drizzle(options, drizzleStore);

AppRegistry.registerComponent(appName, () => () => <App drizzle={drizzle} />);
