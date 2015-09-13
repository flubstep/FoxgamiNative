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
          source={require('image!logo')}
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
    width: 28,
    height: 28,
    margin: 10,
    marginTop: 26,
  },
});

module.exports = FoxgamiNav;