// @flow
import { combineReducers } from 'redux'

//  status: 'started' | 'playing' | 'completed'

const initialStatusState: string = 'started'

const status = (state = initialStatusState, action) => {
  switch (action.type) {
  case 'WORD_CHANGE':
    return 'playing'
  case 'WORD_COMPLETED':
    return 'completed'
  case 'STATUS_CHANGE':
    return action.payload
  default:
    return state
  }
}

const initialWordState: string = ''

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
  bounds: any,// rectangle
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
    state[action.payload.index].bounds = action.payload.bounds
    return Array.from(state)
  case 'RELEASE_DROPZONE':
    if (state[action.payload.index].status === 'correct')      {
      return state
    }
    state[action.payload.index].status = action.payload.match ? 'correct' : 'incorrect'
    return Array.from(state)
  case 'MOVE_INSIDE_DROPZONE':// action.payload is hovered index
    var change = false
    for (var i = 0; i < state.length; i++)    {
      const zone = state[i]
      if (zone.index === action.payload)      {
        if (zone.status === 'empty' || zone.status === 'incorrect')        {
          zone.status = 'highlighted'
          change = true
        }
      }      else      {
        if (zone.status === 'highlighted')        {
          zone.status = 'empty'
          change = true
        }
      }
    }
    if (change)      {
      return Array.from(state)
    }    else      {
      return state
    }
  case 'MOVE_OUTSIDE_DROPZONE':
    var change = false
    for (var i = 0; i < state.length; i++)    {
      const zone = state[i]
      if (zone.status === 'highlighted')      {
        zone.status = 'empty'
        change = true
      }
    }
    if (change)      {
      return Array.from(state)
    }    else      {
      return state
    }

  default:
    return state
  }
}

export default combineReducers({
  status,
  word,
  letterDrops
})
