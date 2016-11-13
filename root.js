import React, { Component, } from 'react';
import { AppRegistry, Dimensions, StyleSheet, Text, View, StatusBar,PanResponder, Animated } from 'react-native';
import Svg, { Text as SvgText,} from 'react-native-svg'

const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')

//todo: use Dimensions to add individual rows of components or find some react layout because you can't drag verticallt 
class Letter extends Component {
  render() {
    return (
     <Svg height="50" width="50"><SvgText stroke="purple" fontSize="20" fontWeight="bold">{this.props.value.toUpperCase()}</SvgText></Svg>
    );
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

  render() {
    return (
      <Animated.View
        {...this.state.panResponder.panHandlers}
        style={this.state.pan.getLayout()}>
        {this.props.children}
      </Animated.View>
    );
  }
}

// const initialState = {
//   absoluteChangeX: 0,
//   absoluteChangeY: 0,
//   changeX: 0,
//   changeY: 0
// };

// class PannableLetter extends Component {
//   constructor(props, context) {
//     super(props, context);
//     this.lastX = 0;
//     this.lastY = 0;
//     this.absoluteChangeY = 0;
//     this.absoluteChangeX = 0;
//     this.state = Object.assign({}, initialState, {transform: new Animated.ValueXY()});
//   }

//   componentWillMount() {
//     this.panResponder = PanResponder.create({
//       onStartShouldSetPanResponder: ({ nativeEvent: { touches } }, { x0, y0 }) => {
//         const shouldSet = touches.length === 1;
//         if (shouldSet) {
//           const { onPanBegin } = this.props;
//           onPanBegin && onPanBegin({ // eslint-disable-line no-unused-expressions
//             originX: x0,
//             originY: y0
//           });
//         }
//         return shouldSet;
//       },
//       onMoveShouldSetPanResponder: ({ nativeEvent: { touches } }) => {
//         return touches.length === 1;
//       },
//       onPanResponderMove: (evt, { dx, dy }) => {
//         const { onPan } = this.props;
//         const panState = {
//           absoluteChangeX: this.lastX + dx,
//           absoluteChangeY: this.lastY + dy,
//           changeX: dx,
//           changeY: dy
//         };

//         onPan && onPan(panState); // eslint-disable-line no-unused-expressions

//         this.absoluteChangeX = panState.absoluteChangeX;
//         this.absoluteChangeY = panState.absoluteChangeY;
//         if (setGestureState) {
//           this.setState(panState);
//         }
//       },

//       onPanResponderTerminationRequest: () => true,
//       // onPanResponderTerminate: this.handlePanResponderRelease,
//       // onPanResponderRelease: this.handlePanResponderRelease
//     });
//   }

//   // handlePanResponderRelease = () => {
//   //   console.log(12341234);
//   //   debugger;
//   //   // const { onPanEnd } = this.props;
//   //   // this.lastX = this.absoluteChangeX;
//   //   // this.lastY = this.absoluteChangeY;
//   //   // onPanEnd && onPanEnd(); // eslint-disable-line no-unused-expressions
//   // }

//   render() {
//     const {
//       onPanBegin,
//       onPan,
//       onPanEnd,
//       resetPan,
//       panDecoratorStyle,
//       ...props
//     } = this.props;

//     const style = {
//       ...panDecoratorStyle,
//       alignSelf: 'flex-start'
//     };

//     return (
//       <Animated.View {...this.panResponder.panHandlers} style={style}>
//         <Letter {...props} {...this.state} />
//       </Animated.View>
//     );
//   }
// }



export default class wordmatch extends Component {
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.lettersContainer}>
          {letters.map(letter => (
            <DraggableView>
            <Letter value={letter} key={letter} />
            </DraggableView>
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
