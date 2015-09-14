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


let Modes = {
  viewing: 1,
  drawing: 2,
};


class Reaction {

  constructor(gestures) {
    this.gestures = gestures || [];
    this.reset();
  }

  addGesture(points) {
    if (points.length > 0) {
      this.gestures.push(points);
    }
  }

  replayLength() {
    return this.replayedGestures.length;
  }

  reset() {
    this.replayedGestures = [[]];
  }

  empty() {
    return this.gestures.length === 0;
  }

  copy() {
    return new Reaction(this.gestures.slice());
  }

  done() {
    return (
      this.empty() || (
        this.replayedGestures.length === this.gestures.length &&
        this.lastReplayedGesture().length === this.gestures[this.gestures.length-1].length
      ));
  }

  lastReplayedGesture() {
    return this.replayedGestures[this.replayedGestures.length - 1];
  }

  stepGestureLength() {
    let gestureIndex = (this.replayedGestures.length - 1);
    if (!this.gestures[gestureIndex]) {
      return;
    }
    if (this.replayedGestures[gestureIndex].length >= this.gestures[gestureIndex].length) {
      this.replayedGestures.push([]);
    }
  }

  step() {
    if (this.done()) {
      return true;
    }
    this.stepGestureLength();
    let gestureIndex = this.replayedGestures.length - 1;
    let pointIndex = this.replayedGestures[gestureIndex].length;
    let point = this.gestures[gestureIndex][pointIndex];
    this.replayedGestures[gestureIndex].push(point);
    return false;
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
    this.props.startDrawing();
  }

  _handleShare() {
    this.props.share();
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

  _handleCancel() {
    this.props.stopDrawing();
  }

  _handleDone() {
    this.props.saveReaction();
    this.props.stopDrawing();
  }

  _handleUndo() {
    // TODO
  }

  render() {
    return (
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <IconButton
            onPress={this._handleCancel.bind(this)}
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
    this.reaction = new Reaction();
  }

  addTouchPoint(x, y) {
    var newCurrentPoints = this.state.currentPoints;
    newCurrentPoints.push({x: x, y: y});

    this.setState({
      donePaths: this.state.donePaths,
      currentPoints: newCurrentPoints,
      currentMax: this.state.currentMax
    });
  }

  releaseTouch() {
    var newPaths = this.state.donePaths;
    if (this.state.currentPoints.length > 0) {
      newPaths.push(<Shape
        key={this.state.currentMax}
        d={pointsToSvg(this.state.currentPoints)}
        stroke="#FFFFFF"
        strokeWidth={8}
      />);
    }
    this.reaction.addGesture(this.state.currentPoints);
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
      <View style={styles.drawContainer}>
        <View
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
        <FoxgamiDrawHeader
          stopDrawing={this.props.stopDrawing}
          saveReaction={() => this.props.saveReaction(this.reaction)}
        />
      </View>
    )
  }
}


// TODO: This shares a lot of functionality with the above...
// consolidate into its own base class
var FoxgamiReplaySurface = React.createClass({

  mixins: [TimerMixin],

  getInitialState() {
    return {
      complete: false,
      donePaths: [],
      currentPoints: [],
      currentMax: 1
    };
  },

  componentDidMount() {
    this.setInterval(this.onTick, 20);
  },

  onTick() {
    if (!this.props.reaction) {
      return;
    }
    if (this.state.complete) {
      return;
    }

    let reaction = this.props.reaction;
    let nextState = this.state;

    if (reaction.step() === true) {
      nextState.complete = true;
    }

    if (reaction.replayLength() > this.state.currentMax) {
      let lastCompleteGesture = reaction.replayedGestures[this.state.currentMax];
      let lastCompletePath = pointsToSvg(lastCompleteGesture);
      let lastShape = (<Shape
        key={this.state.currentMax}
        d={pointsToSvg(this.state.currentPoints)}
        stroke="#FFFFFF"
        strokeWidth={8}
      />);
      nextState.donePaths.push(lastShape);
      nextState.currentMax++;
    }

    if (this.state.currentMax <= reaction.replayedGestures.length) {
      nextState.currentPoints = reaction.lastReplayedGesture().slice();
    }
    this.setState(nextState);
  },

  render() {
    return (
      <View style={styles.drawContainer}>
        <Surface style={styles.drawSurface} width={375} height={667}>
          <Group>
            {this.state.donePaths}
            <Shape key={this.state.currentMax} d={pointsToSvg(this.state.currentPoints)} stroke="#FFFFFF" strokeWidth={8} />
          </Group>
        </Surface>
        <FoxgamiStoryHeader
          startDrawing={this.props.startDrawing}
          share={this.props.playReaction}
          navigator={this.props.navigator}
        />
      </View>
    );
  }

})


class FoxgamiStory extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      playingReaction: null,
      reactions: [],
      mode: Modes.viewing
    };
  }

  _saveReaction(reaction) {
    this.setState({
      reactions: this.state.reactions.concat([reaction]),
    });
  }

  // TODO: remove once not testing
  _playLatestReaction() {
    if (this.state.reactions.length > 0) {
      let reaction = this.state.reactions[this.state.reactions.length - 1];
      this._playReaction(reaction.copy());
    }
  }

  _playReaction(reaction) {
    this.setState({
      playingReaction: reaction,
      mode: Modes.viewing
    });
  }

  _startDrawing(mode) {
    this.setState({
      playingReaction: null,
      mode: Modes.drawing
    });
  }

  _stopDrawing(mode) {
    this.setState({
      mode: Modes.viewing
    });
  }

  render() {
    if (this.state.mode === Modes.drawing) {
      var drawSurface = (
        <FoxgamiDrawSurface
          stopDrawing={this._stopDrawing.bind(this)}
          saveReaction={this._saveReaction.bind(this)}
          navigator={this.props.navigator}
        />
      );
    } else {
      var drawSurface = (
        <FoxgamiReplaySurface
          reaction={this.state.playingReaction}
          startDrawing={this._startDrawing.bind(this)}
          playReaction={this._playLatestReaction.bind(this)}
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
        {drawSurface}
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