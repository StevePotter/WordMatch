import React, { Component, } from 'react';
import { AppRegistry, Dimensions, StyleSheet, Text, View, StatusBar,PanResponder, Animated,NativeModules, UIManager, findNodeHandle } from 'react-native'
import { connect, Provider } from 'react-redux'
import Svg, { Text as SvgText, Rect} from 'react-native-svg'
import Rectangle from 'rectangle-node'//http://rahatah.me/rectangle-node/
import store from "./store"
import {wordChange as wordChangeAction} from "./actions"

const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')

store.dispatch(wordChangeAction("dog"))
dropzones = []



class Letter extends Component {
  render() {
    return (
     <Svg height="50" width="50"><SvgText stroke="purple" fontSize="20" fontWeight="bold">{this.props.value.toUpperCase()}</SvgText></Svg>
    );
  }
}


//props: letter, index, dropzone, onLayoutChanged
//status: empty, filled, highlighted
class LetterDropzone extends Component
{
  onLayout = ({nativeEvent}) =>
  {
    var view = this.refs['root'];
    var handle = findNodeHandle(view);
    UIManager.measure(handle, (x,y,width,height,pageX,pageY) =>
    {
      dropzones[this.props.index] = new Rectangle(pageX,pageY, width, height);
//      console.log(`Letter receiver ${pageX}, ${pageY}, ${width}, ${height}`)
    });
  }

  renderInside()
  {
    if (this.props.status === 'empty')
    {
      return <Rect height="100" width="80" fill="white" strokeWidth="2" stroke="black">
        </Rect>
    }
    if (this.props.status === 'highlighted')
    {
      return <Rect height="100" width="80" fill="white" strokeWidth="2" stroke="red">
        </Rect>
    }
    if (this.props.status === 'correct')
    {
      return <Rect height="100" width="80" fill="white" strokeWidth="2" stroke="red">
          <SvgText stroke="purple" fontSize="20" fontWeight="bold">{this.props.letter}</SvgText>
        </Rect>
    }
        
  }

  render() {
    return <View ref="root" height={100} width={80} onLayout={this.onLayout}>
      <Svg height="100" width="80">
      {this.renderInside()}
      </Svg>
    </View>
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
      onStartShouldSetPanResponder: () => {
        console.log(dropzones);
        return true
      },      
      onPanResponderMove: (evt, gestureState) => {
        //https://facebook.github.io/react-native/docs/panresponder.html
        let dx = gestureState.dx
        let dy = gestureState.dy
        let pointerX = gestureState.x0 + gestureState.dx;
        let pointerY = gestureState.y0 + gestureState.dy;
//        console.log(`pointer ${pointerX}, ${pointerY}  ${dropzones.length}`);
        for(let i = 0; i < dropzones.length; i++)
        {
          var zone = dropzones[i];
          if (zone.contains(pointerX, pointerY))
          {
            console.log("mouse pointer in drop zone!")
          }
        }
        
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

class WordMatchUI extends Component {
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
          <View style={styles.LetterDropzonesContainer}>
            {this.props.letterDrops.map((value) => (
              <LetterDropzone letter={value.letter} key={value.index} index={value.index} status={value.status} />
            ))}
          </View>
        </View>
    );
  }
}

const mapStateToProps = state => ({ letterDrops: state.letterDrops })
const WordMatch = connect(
  mapStateToProps,
  null
)(WordMatchUI)


class App extends Component {
  render() {
    return (
      <Provider store={store}>
      <WordMatch />
      </Provider>
    );
  }
}
// const mapDispatchToProps = dispatch => ({
//   onSocialSelect: (socialId) => {
//     dispatch(newReleaseSelectSocial(socialId))
//   },
//   onDeselectSocial: (socialId) => {
//     dispatch(newReleaseDeselectSocial(socialId))
//   }
// })




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
  LetterDropzonesContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,    
  }
});

AppRegistry.registerComponent('wordmatch', () => App);
