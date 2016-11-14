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
    return Array.from(state);
  case 'RELEASE_DROPZONE_SUCCESS':
    state[action.payload].status = 'correct';
    return Array.from(state);
  case 'MOVE_INSIDE_DROPZONE'://action.payload is hovered index
    var change = false;
    for (var i = 0; i < state.length; i++)
    {
      const zone = state[i];
      if (zone.index === action.payload)
      {
        if (zone.status === 'empty' || zone.status === 'incorrect')
        {
          zone.status = 'highlighted'
          change = true;
        }
      }
      else
      {
        if (zone.status === 'highlighted')
        {
          zone.status = 'empty'
          change = true
        }
      }
    }
    if (change)
      return Array.from(state);
    else
      return state;
  case 'MOVE_OUTSIDE_DROPZONE':
    var change = false;
    for (var i = 0; i < state.length; i++)
    {
      const zone = state[i];
      if (zone.status === 'highlighted')
      {
        zone.status = 'empty'
        change = true
      }
    }
    if (change)
      return Array.from(state);
    else
      return state;

  default:
    return state
  }
}

export default combineReducers({
  word,
  letterDrops
})