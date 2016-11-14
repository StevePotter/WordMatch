import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'
import reducer from './reducers'

const middlewares = []
middlewares.push(thunkMiddleware)

/* global process:true*/
if (process.env.NODE_ENV === 'development') {
  middlewares.push(createLogger())
}

export default createStore(reducer,
  applyMiddleware(
    ...middlewares
  )
)
