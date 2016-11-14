import React, { Component, } from 'react';
import { AppRegistry, Dimensions, StyleSheet, Button, Text, View, StatusBar,PanResponder, Animated, UIManager, findNodeHandle } from 'react-native'
import { connect, Provider } from 'react-redux'
import Svg, { Text as SvgText, Rect, G, Line} from 'react-native-svg'
import Rectangle from 'rectangle-node'//http://rahatah.me/rectangle-node/
import store from "./store"
import {wordChange as wordChangeAction, setDropZoneBounds as setDropZoneBoundsAction, 
  moveInsideDropZone as moveInsideDropZoneAction, 
  moveOutsideDropZone as moveOutsideDropZoneAction,
  resolveStatus as resolveStatusAction,
  chooseNewWord as chooseNewWordAction,
  releaseDropZone as releaseDropZoneAction } from "./actions"
import Speech from "react-native-speech"

store.dispatch(chooseNewWordAction())

/*
Root app entry
*/
class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <RootScreen />
      </Provider>
    );
  }
}

/*
Top level visible screen
*/
class RootScreenUI extends Component {
  render() {
    const status = this.props.status
    if (status === 'started')
    { 
      return <View></View>
    }
    if (status === 'playing')
    {
      return <WordMatch />
    }
    if (status === 'completed')
    {
      return <CompletedUI />
    }
  }
}
const RootScreen = connect(
  state => ({ status: state.status }),
  null
)(RootScreenUI)

class CompletedUI extends Component
{
  newWord = () => {
    store.dispatch(chooseNewWordAction())
  }

  render() {
    return <View style={styles.container}>
      <Text>GREAT JOB!!!</Text>
      <Button title="Do Another" onPress={this.newWord} />
    </View>
  }
}

/*
Main screen for the game, where you drag the letters of a word into their proper place
*/
class WordMatchUI extends Component {
  componentWillMount() {
    this.sayWord()
  }

  sayWord = () => {
    Speech.isSpeaking().then(speaking => {
      if (speaking)
        return;
      let parts = this.props.word.split("")
      parts.unshift(this.props.word)   
      const sentence = parts.join("...")
      Speech.speak({
        text: sentence,
        voice: 'en-US'
      })

    });
  }

  render() {
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')
    return (
      <View style={styles.container}>
        <View style={styles.lettersContainer}>
          {letters.map(letter => (
            <DraggableLetter key={letter} letter={letter} />
          ))}
        </View>
        
        <View style={styles.playSoundContainer}>
          <Button title="Repeat" onPress={this.sayWord} />
        </View>
        <View style={styles.letterDropzonesContainer}>
          {this.props.letterDrops.map((value) => (
            <LetterDropzone letter={value.letter} key={value.index} index={value.index} status={value.status} />
          ))}
        </View>
      </View>
    );
  }
}
const WordMatch = connect(
  state => ({ letterDrops: state.letterDrops, word: state.word }),
  null
)(WordMatchUI)


/*
One of the letters of the alphabet you can drag into a drop zone to complete the word.
*/
class DraggableLetterUI extends React.Component {
  constructor(props) {
    super(props);
    this.state = { pan: new Animated.ValueXY()};
  }

  findZoneForGesture(gestureState) {
    const dropzones = this.props.letterDrops;
    let pointerX = gestureState.x0 + gestureState.dx;
    let pointerY = gestureState.y0 + gestureState.dy;
    for(let i = 0; i < dropzones.length; i++)
    {
      var zone = dropzones[i];
      if (zone.bounds && zone.bounds.contains(pointerX, pointerY))
      {
        return zone;
      }
    }
  }

  componentWillMount() {
    this.state.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => {
        return true
      },      
      onPanResponderMove: (evt, gestureState) => {
        const zone = this.findZoneForGesture(gestureState)
        if (zone)
        {
          store.dispatch(moveInsideDropZoneAction(zone.index))
        }
        else
        {
          store.dispatch(moveOutsideDropZoneAction())          
        }        
        this.state.pan.setValue({
          x: gestureState.dx,
          y: gestureState.dy,
        });
      },
      onPanResponderRelease: (evt, gestureState) => {
        const zone = this.findZoneForGesture(gestureState)
        let animateBack = true
        if (zone) {
          const match = zone.letter === this.props.letter
          store.dispatch(releaseDropZoneAction({ index: zone.index, match: match}))
          if (match)
          {
            animateBack = false
            store.dispatch(resolveStatusAction())
          }
        }
        if (animateBack)
        {
          Animated.spring(
            this.state.pan,         // Auto-multiplexed
            {toValue: {x: 0, y: 0}} // Back to zero
          ).start();
        }
        else
        {
          this.state.pan.setValue({ x: 0,y: 0, });          
        }
      }
    });
  }

  getStyle = () => {
    return { zIndex: 10, transform: this.state.pan.getTranslateTransform() }
  }

  render() {
    return (
      <Animated.View {...this.state.panResponder.panHandlers} style={this.getStyle()}>
         <Svg height="50" width="50"><SvgText stroke="purple" fontSize="20" fontWeight="bold">{this.props.letter.toUpperCase()}</SvgText></Svg>
      </Animated.View>
    );
  }
}

const DraggableLetter = connect(
  state => ({ letterDrops: state.letterDrops }),
  null
)(DraggableLetterUI)



//props: letter, index, dropzone, onLayoutChanged
//status: empty, filled, highlighted
class LetterDropzone extends Component
{
  constructor(props) {
    super(props);
    this.state = { renderTempIncorrect: true };
  }

  onLayout = ({nativeEvent}) =>
  {
    var view = this.refs['root'];
    var handle = findNodeHandle(view);
    UIManager.measure(handle, (x,y,width,height,pageX,pageY) =>
    {
      store.dispatch(setDropZoneBoundsAction({index: this.props.index, bounds: new Rectangle(pageX,pageY, width, height)}))
    });
  }

  componentWillReceiveProps(nextProps)
  {
    if (nextProps.status === 'incorrect' && this.state.renderTempIncorrect)
    {
      setTimeout(() =>
      {
        this.setState({ renderTempIncorrect: false })
      },2000)
    }
  }

  renderInside()
  {
    var height = 100;
    var width = 80;
    switch(this.props.status) {
    case 'empty':
      return <Rect height={100} width={width} fill="white" strokeWidth="2" stroke="black"></Rect>
    case 'highlighted':
      return <Rect height={height} width={width} fill="white" strokeWidth="2" stroke="red"></Rect>
    case 'correct':
      return <G><Rect height={height} width={width} fill="white" strokeWidth="0" stroke="red"></Rect>
          <SvgText x="20" y="20" textAnchor="middle" stroke="purple" fontSize="60" fontWeight="bold">{this.props.letter.toUpperCase()}</SvgText>
        </G>
    case 'incorrect':
      if ( this.state.renderTempIncorrect )
      {
        return <G>
          <Rect height={height} width={width} fill="white" strokeWidth="0" />
          <Line x1="0" y1="0" x2={width} y2={height} stroke="red" strokeWidth="2" />
          <Line x1={width} y1="0" x2="0" y2={height} stroke="red" strokeWidth="2" />
        </G>
      }
      else
      {
        return <Rect height={height} width={width} fill="white" strokeWidth="2" stroke="black" />        
      }
    }
  }

  render() {
    var height = 100;
    console.log(styles.letterDropzone)
    var width = 80;
    return <View style={styles.letterDropzone} ref="root" onLayout={this.onLayout}>
      <Svg height={height} width={width}>
      {this.renderInside()}
      </Svg>
    </View>
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
  letterDropzone: {
    marginLeft: 2,
    marginRight: 2,
    height: 100,
    width: 80,
  },
  letterDropzonesContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  }
});

AppRegistry.registerComponent('wordmatch', () => App);
