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
  TouchableOpacity
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

class IconButton extends React.Component {

  render() {
    // let imageStyle = this.props.location == "right" ? styles.iconRight : styles.iconLeft;
    return (
      <TouchableOpacity style={styles.iconButton} onPress={this.props.onPress}>
        <Image style={styles.icon} source={this.props.source} />
      </TouchableOpacity>
    )
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
          <IconButton
            onPress={this._handlePulldown.bind(this)}
            source={require('image!Pulldown')}
            location={"left"}
            />
        </View>
        <View style={styles.headerRight}>
          <IconButton
            onPress={this._handleDraw.bind(this)}
            source={require('image!Smilie')}
            location={"right"}
            />
          <IconButton
            onPress={this._handleShare.bind(this)}
            source={require('image!Share')}
            location={"right"}
            />
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
          <IconButton
            onPress={this._handleDone.bind(this)}
            source={require('image!Cancel')}
            location={"left"}
            />
        </View>
        <View style={styles.headerRight}>
          <IconButton
            onPress={this._handleUndo.bind(this)}
            source={require('image!Undo')}
            location={"right"}
            />
          <IconButton
            onPress={this._handleDone.bind(this)}
            source={require('image!Done')}
            location={"right"}
          />
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
    backgroundColor: '#000000',
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
    marginRight: 8,
  },
  icon: {
    marginLeft: 16,
    marginRight: 16,
  },
  iconButton: {
    height: 32,
  },
  headerLeft: {

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