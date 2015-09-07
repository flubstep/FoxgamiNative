'use strict';

let React = require('react-native');
let {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
} = React;

let {Colors} = require('./BaseStyles');

class FoxgamiNav extends React.Component {

  render() {
    return (
      <View style={styles.container}>
        <Image
          style={styles.iconNavLogo}
          source={{uri: "http://www.foxgami.com/client/resources/logo_large.png"}}
        />
      </View>
    );
  }
}

let styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  iconNavLogo: {
    alignItems: 'center',
    width: 32,
    height: 32,
    margin: 8,
    marginTop: 24,
  },
});

module.exports = FoxgamiNav;