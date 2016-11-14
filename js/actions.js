import { createAction } from 'redux-actions'

export const wordChange = createAction('WORD_CHANGE')
export const statusChange = createAction('STATUS_CHANGE')
export const setDropZoneBounds = createAction('SET_DROPZONE_BOUNDS')
export const moveInsideDropZone = createAction('MOVE_INSIDE_DROPZONE')
export const moveOutsideDropZone = createAction('MOVE_OUTSIDE_DROPZONE')
export const releaseDropZone = createAction('RELEASE_DROPZONE')
export const wordCompleted = createAction('WORD_COMPLETED')

export function resolveStatus() {
  return (dispatch, getState) => {
    const state = getState()
    if (state.letterDrops.every((item) => item.status === 'correct'))
    {
      return dispatch(wordCompleted())
    }
  }
}