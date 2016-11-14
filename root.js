import React, { Component, } from 'react';
import { AppRegistry, Dimensions, StyleSheet, Text, View, StatusBar,PanResponder, Animated,NativeModules, UIManager, findNodeHandle } from 'react-native'
import { connect, Provider } from 'react-redux'
import Svg, { Text as SvgText, Rect, G} from 'react-native-svg'
import Rectangle from 'rectangle-node'//http://rahatah.me/rectangle-node/
import store from "./store"
import {wordChange as wordChangeAction, setDropZoneBounds as setDropZoneBoundsAction, 
  moveInsideDropZone as moveInsideDropZoneAction, 
  moveOutsideDropZone as moveOutsideDropZoneAction,
  releaseDropZoneSuccess as releaseDropZoneSuccessAction } from "./actions"

const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')

store.dispatch(wordChangeAction("dog"))
dropzones = []




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
      store.dispatch(setDropZoneBoundsAction({index: this.props.index, bounds: new Rectangle(pageX,pageY, width, height)}))
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
      return <G><Rect height="100" width="80" fill="white" strokeWidth="2" stroke="red"></Rect>
          <SvgText x="20" y="20" textAnchor="middle" stroke="purple" fontSize="40" fontWeight="bold">{this.props.letter.toUpperCase()}</SvgText>
        </G>
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

class DraggableLetter extends React.Component {
  constructor(props) {
    super(props);
    this.lastX = 0;
    this.lastY = 0;
    this.absoluteChangeY = 0;
    this.absoluteChangeX = 0;    
    this.state = Object.assign({}, initialState, {pan: new Animated.ValueXY()});
  }
  componentWillMount() {
    this.state.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => {
//        console.log(dropzones);
        return true
      },      
      onPanResponderMove: (evt, gestureState) => {
        //https://facebook.github.io/react-native/docs/panresponder.html
        let dx = gestureState.dx
        let dy = gestureState.dy
        const dropzones = store.getState().letterDrops;
        let pointerX = gestureState.x0 + gestureState.dx;
        let pointerY = gestureState.y0 + gestureState.dy;
        var inone = false;
        for(let i = 0; i < dropzones.length; i++)
        {
          var zone = dropzones[i];
          if (zone.bounds.contains(pointerX, pointerY))
          {
            store.dispatch(moveInsideDropZoneAction(i))
            inone = true;
            break;
          }
        }
        if (!inone)
        {
          store.dispatch(moveOutsideDropZoneAction())
        }
        
        const panState = {
          absoluteChangeX: this.lastX + dx,
          absoluteChangeY: this.lastY + dy,
          changeX: dx,
          changeY: dy
        };

        this.state.pan.setValue({
          x: absoluteChangeX,
          y: absoluteChangeY,
        });
        this.absoluteChangeX = panState.absoluteChangeX;
        this.absoluteChangeY = panState.absoluteChangeY;
        this.setState(panState);
      },      
      onPanResponderRelease: (evt, gestureState) => {
        console.log(this.props.letter);
        //https://facebook.github.io/react-native/docs/panresponder.html
        let dx = gestureState.dx
        let dy = gestureState.dy
        const dropzones = store.getState().letterDrops;
        let pointerX = gestureState.x0 + gestureState.dx;
        let pointerY = gestureState.y0 + gestureState.dy;
        var inone = false;
        for(let i = 0; i < dropzones.length; i++)
        {
          var zone = dropzones[i];
          if (zone.bounds.contains(pointerX, pointerY))
          {
            if (zone.letter === this.props.letter)
            {
              inone = true;
              store.dispatch(releaseDropZoneSuccessAction(i))
              this.state.pan.setValue({
                x: 0,
                y: 0,
              });           
            }//todo: error when wrong letter
            break;
          }
        }
        if (!inone)
        {
          Animated.spring(
            this.state.pan,         // Auto-multiplexed
            {toValue: {x: 0, y: 0}} // Back to zero
          ).start();
        }
      },
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
         <Svg height="50" width="50"><SvgText stroke="purple" fontSize="20" fontWeight="bold">{this.props.letter.toUpperCase()}</SvgText></Svg>
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
            <DraggableLetter key={letter} letter={letter} />
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
