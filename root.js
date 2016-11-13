import React, { Component, } from 'react';
import { AppRegistry, Dimensions, StyleSheet, Text, View, StatusBar,PanResponder, Animated } from 'react-native';
import Svg, { Text as SvgText, Rect} from 'react-native-svg'

const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')


let word = "dog"

class Letter extends Component {
  render() {
    return (
     <Svg height="50" width="50"><SvgText stroke="purple" fontSize="20" fontWeight="bold">{this.props.value.toUpperCase()}</SvgText></Svg>
    );
  }
}

class LetterReceiver extends Component
{
  render() {
    return (
     <Svg height="100" width="80"><Rect height="100" width="80" fill="white" strokeWidth="2" stroke="red"><SvgText stroke="purple" fontSize="20" fontWeight="bold"></SvgText></Rect></Svg>
    )
  }
}

const initialState = {
  absoluteChangeX: 0,
  absoluteChangeY: 0,
  changeX: 0,
  changeY: 0
};

class DraggableView extends React.Component {
  constructor(props) {
    super(props);
    this.lastX = 0;
    this.lastY = 0;
    this.absoluteChangeY = 0;
    this.absoluteChangeX = 0;    
    this.state = Object.assign({}, initialState, {pan: new Animated.ValueXY()});
  }
  componentWillMount() {
  //  this.state = {
  //    pan: new Animated.ValueXY(), // inits to zero
  //  };
    this.state.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, { dx, dy }) => {
        const panState = {
          absoluteChangeX: this.lastX + dx,
          absoluteChangeY: this.lastY + dy,
          changeX: dx,
          changeY: dy
        };

        this.onPan(panState); // eslint-disable-line no-unused-expressions
        this.absoluteChangeX = panState.absoluteChangeX;
        this.absoluteChangeY = panState.absoluteChangeY;
//        if (setGestureState) {
          this.setState(panState);
//        }
      },      
      // onPanResponderMove: Animated.event([null, {
      //   dx: this.state.pan.x, // x,y are Animated.Value
      //   dy: this.state.pan.y,
      // }]),
      onPanResponderRelease: () => {
        Animated.spring(
          this.state.pan,         // Auto-multiplexed
          {toValue: {x: 0, y: 0}} // Back to zero
        ).start();
      },
    });
  }
  
  onPan = ({ absoluteChangeX, absoluteChangeY }) => {
    this.state.pan.setValue({
      x: absoluteChangeX,
      y: absoluteChangeY,
    });
  }

  getStyle = () => {
    return { zIndex: 10, transform: this.state.pan.getTranslateTransform() }
  }

  render() {
    return (
      <Animated.View
        {...this.state.panResponder.panHandlers}
        style={this.getStyle()}>
        {this.props.children}
      </Animated.View>
    );
  }
}

export default class wordmatch extends Component {
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.lettersContainer}>
          {letters.map(letter => (
            <DraggableView key={letter}>
            <Letter value={letter} />
            </DraggableView>
          ))}
        </View>
        <View style={styles.letterReceiversContainer}>
          {word.split("").map(letter => (
            <LetterReceiver value={letter} key={letter} />
          ))}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    marginTop: 50,
  },
  lettersContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  letterReceiversContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,    
  }
});

AppRegistry.registerComponent('wordmatch', () => wordmatch);
