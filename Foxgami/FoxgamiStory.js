'use strict';

let React = require('react-native');
let {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  ListView,
  PanResponder,
  PropTypes
} = React;

let ReactART = require('ReactNativeART');
let {
  LinearGradient,
  RadialGradient,
  Pattern,
  Transform,
  Path,
  Surface,
  Group,
  ClippingRectangle,
  Shape
} = ReactART;

let TimerMixin = require('react-timer-mixin');

let {Colors} = require('./BaseStyles');
let FoxgamiNav = require('./FoxgamiNav');


class FoxgamiStory extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      points: [],
    };
  }

  componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
      onPanResponderGrant: this._handlePanResponderGrant.bind(this),
      onPanResponderMove: this._handlePanResponderMove.bind(this),
      onPanResponderRelease: this._handlePanResponderEnd.bind(this),
    });
  }

  _handlePanResponderGrant(evt, gestureState) {
    var newPoints = this.state.points;
    newPoints.push({down: true, x: gestureState.x0, y: gestureState.y0 });
    newPoints.push({down: false, x: gestureState.x0, y: gestureState.y0 });
    this.setState({ points: newPoints });
  }

  _handlePanResponderMove(evt, gestureState) {
    var newPoints = this.state.points;
    newPoints.push({down: false, x: gestureState.moveX, y: gestureState.moveY });
    this.setState({ points: newPoints })
  }

  _handlePanResponderEnd(evt, gestureState) {

  }

  _renderImage() {
    <Image
      style={styles.storyImage}
      source={{uri: this.props.story.image_url}}
    />
  }

  _buildPath(points) {
    var path = "";
    if (points.length > 0) {
      path = "M" + points[0].x + "," + points[0].y;
    }
    points.forEach((point) => {
      if (point.down) {
        path = path + " M" + points[0].x + "," + points[0].y;
      }
      path = path + " L" + point.x + "," + point.y;
    });
    return path;
  }

  render() {
    let path = this._buildPath(this.state.points);
    return (
      <View style={styles.container}
        {...this._panResponder.panHandlers}
        >
        <Surface width={375} height={667}>
          <Group>
            <Shape d={path} stroke="#FFFFFF" strokeWidth={8} />
          </Group>
        </Surface>
      </View>
      );
  }
}

let styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark,
  },
  baseText: {
    fontFamily: 'Gill Sans',
  },
  storyImage: {
    height: 384,
    width: 384,
  },
  small: {
    fontSize: 13,
    color: Colors.subdued,
    marginLeft: 12,
    marginRight: 12,
    marginBottom: 24,
  },
  medium: {
    fontSize: 16,
    margin: 12,
    marginBottom: 6,
    color: Colors.white,
  },
});

module.exports = FoxgamiStory;