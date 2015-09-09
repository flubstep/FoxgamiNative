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
  PropTypes,
  TouchableHighlight
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


function pointsToSvg(points) {
  if (points.length > 0) {
    var path = `M ${points[0].x},${points[0].y}`;
    points.forEach((point) => {
      path = path + ` L ${point.x},${point.y}`;
    });
    return path;
  } else {
    return '';
  }
}

class FoxgamiStoryHeader extends React.Component {

  _handlePulldown() {
    this.props.navigator.pop();
  }

  _handleDraw() {
    this.props.setDrawMode(true);
  }

  _handleShare() {
    // TODO
  }

  render() {
    return (
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableHighlight onPress={this._handlePulldown.bind(this)}>
            <Image source={require('image!Pulldown')} />
          </TouchableHighlight>
        </View>
        <View style={styles.headerRight}>
          <TouchableHighlight onPress={this._handleDraw.bind(this)}>
            <Image style={styles.iconRight} source={require('image!Smilie')} />
          </TouchableHighlight>
          <TouchableHighlight onPress={this._handleShare.bind(this)}>
            <Image style={styles.iconRight} source={require('image!Share')} />
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}

class FoxgamiDrawHeader extends React.Component {

  _handleDone() {
    this.props.setDrawMode(false);
  }

  _handleUndo() {
    // TODO
  }

  render() {
    return (
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableHighlight onPress={this._handleDone.bind(this)}>
            <Image source={require('image!Cancel')} />
          </TouchableHighlight>
        </View>
        <View style={styles.headerRight}>
          <TouchableHighlight onPress={this._handleUndo.bind(this)}>
            <Image style={styles.iconRight} source={require('image!Undo')} />
          </TouchableHighlight>
          <TouchableHighlight onPress={this._handleDone.bind(this)}>
            <Image style={styles.iconRight} source={require('image!Done')} />
          </TouchableHighlight>
        </View>
      </View>
    );
  }
}

class FoxgamiDrawSurface extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      donePaths: [],
      currentPoints: [],
      currentMax: 0,
    };
  }

  addTouchPoint(x, y) {
    var newCurrentPoints = this.state.currentPoints;
    newCurrentPoints.push({x: x, y: y});

    this.setState({
      donePaths: this.state.donePaths,
      currentPoints: newCurrentPoints
    });
  }

  releaseTouch() {
    var newPaths = this.state.donePaths;
    if (this.state.currentPoints.length > 0) {
      newPaths.push(<Shape key={this.state.currentMax} d={pointsToSvg(this.state.currentPoints)} stroke="#FFFFFF" strokeWidth={8} />);
    }
    this.setState({
      donePaths: newPaths,
      currentPoints: [],
      currentMax: this.state.currentMax + 1,
    });
  }

  _handleResponderGrant(evt) {
    this.addTouchPoint(evt.nativeEvent.pageX, evt.nativeEvent.pageY);
  }

  _handleResponderMove(evt) {
    this.addTouchPoint(evt.nativeEvent.pageX, evt.nativeEvent.pageY);
  }

  _handleResponderEnd(evt) {
    this.releaseTouch();
  }

  render() {
    return (
      <View
        style={styles.drawContainer}
        onStartShouldSetResponder={(evt) => true}
        onMoveShouldSetResponder={(evt) => true}
        onResponderGrant={this._handleResponderGrant.bind(this)}
        onResponderMove={this._handleResponderMove.bind(this)}
        onResponderRelease={this._handleResponderEnd.bind(this)}
        >
        <Surface style={styles.drawSurface} width={375} height={667}>
          <Group>
            {this.state.donePaths}
            <Shape key={this.state.currentMax} d={pointsToSvg(this.state.currentPoints)} stroke="#FFFFFF" strokeWidth={8} />
          </Group>
        </Surface>
      </View>
    )
  }
}


class FoxgamiStory extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      drawMode: false
    };
  }

  _setDrawMode(b) {
    this.setState({
      drawMode: b
    });
  }

  render() {
    if (this.state.drawMode) {
      var maybeDrawSurface = (<FoxgamiDrawSurface/>);
      var header = (
        <FoxgamiDrawHeader
          setDrawMode={this._setDrawMode.bind(this)}
          navigator={this.props.navigator}
        />
      );
    } else {
      var maybeDrawSurface = null;
      var header = (
        <FoxgamiStoryHeader
          setDrawMode={this._setDrawMode.bind(this)}
          navigator={this.props.navigator}
        />
      );
    }
    return (
      <View style={styles.container}>
        <Image
          style={styles.storyImage}
          source={{uri: this.props.story.image_url}}
        />
        {maybeDrawSurface}
        {header}
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
  drawContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 667,
    width: 375,
    backgroundColor: 'rgba(0,0,0,0)',
  },
  header: {
    position: 'absolute',
    top: 0,
    paddingTop: 32,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 375,
  },
  headerRight: {
    flexDirection: 'row',
    marginRight: 24,
  },
  iconRight: {
    marginLeft: 32,
  },
  headerLeft: {
    marginLeft: 17,
  },
  storyImage: {
    height: 375,
    width: 375,
  },
  drawSurface: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0)',
  }

});

module.exports = FoxgamiStory;