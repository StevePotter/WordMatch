import React, { Component, PanResponder, Animated } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  StatusBar
} from 'react-native';
import Svg, { Text as SvgText,} from 'react-native-svg'

const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')


class Letter extends Component {
  render() {
    return (
     <Svg height="50" width="50"><SvgText stroke="purple" fontSize="20" fontWeight="bold">{this.props.value.toUpperCase()}</SvgText></Svg>
    );
  }
}

class PannableLetter extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      transform: new Animated.ValueXY(),
    }
  }

  onPan = ({ absoluteChangeX, absoluteChangeY }) => {
    this.state.transform.setValue({
      x: absoluteChangeX,
      y: absoluteChangeY,
    });
  }

  render() {
    const { transform } = this.state;

    return (
      // we transform the decorator instead of the decorated view,
      // so there won't be any issues with ghost panning,
      // due to the wrapping view staying in place and receiving touches
      <Letter value={this.value}
        onPan={this.onPan}
        panDecoratorStyle={{transform: transform.getTranslateTransform()}} />
    );
  }
}



export default class wordmatch extends Component {
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.lettersContainer}>
          {letters.map(letter => (
            <PannableLetter value={letter} key={letter} />
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
  }
});

AppRegistry.registerComponent('wordmatch', () => wordmatch);
