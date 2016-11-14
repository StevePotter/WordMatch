// @flow
import { combineReducers } from 'redux'

const initialWordState: string = ""

const word = (state: string = initialWordState, action) => {
  switch (action.type) {
  case 'WORD_CHANGE':
    return action.payload
  default:
    return state
  }
}

type LetterDropZoneState = {
  letter: string,
  index: number,
  bounds: any,//rectangle
  status: 'empty' | 'highlighted' | 'correct' | 'incorrect'
}

const initialDropZones: Array<LetterDropZoneState> = []

const letterDrops = (state: Array<LetterDropZoneState> = initialDropZones, action) => {
  switch (action.type) {
  case 'WORD_CHANGE':
    return action.payload.split('').map((letter, index) => { 
      return { letter, index, bounds: null, status: 'empty' }
    })
  case 'SET_DROPZONE_BOUNDS':
    state[action.payload.index].bounds = action.payload.bounds;
    return Object.assign({}, state);
  default:
    return state
  }
}

export default combineReducers({
  word,
  letterDrops
})