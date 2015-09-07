/**
 * This is the entry point for your experience that you will run on Exponent.
 *
 * Start by looking at the render() method of the component called
 * FirstExperience. This is where the text and example components are.
 */
'use strict';

let React = require('react-native');
let {
  Animated,
  AppRegistry,
  Easing,
  Image,
  ScrollView,
  StatusBarIOS,
  NavigatorIOS,
  StyleSheet,
  Text,
  View,
} = React;

let FoxgamiMain = require('./Foxgami/FoxgamiMain');

class FoxgamiNative extends React.Component {

  render() {
    return (
      <NavigatorIOS
        style={styles.container}
        navigationBarHidden={true}
        initialRoute={{
          title: 'Foxgami',
          component: FoxgamiMain
        }}
      />
    );
  }
}

let styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212121',
  },
});

AppRegistry.registerComponent('FoxgamiNative', () => FoxgamiNative);
