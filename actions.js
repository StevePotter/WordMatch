import { createAction } from 'redux-actions'

export const wordChange = createAction('WORD_CHANGE')
export const setDropZoneBounds = createAction('SET_DROPZONE_BOUNDS')
export const moveInsideDropZone = createAction('MOVE_INSIDE_DROPZONE')
export const moveOutsideDropZone = createAction('MOVE_OUTSIDE_DROPZONE')
export const releaseDropZoneSuccess = createAction('RELEASE_DROPZONE_SUCCESS')