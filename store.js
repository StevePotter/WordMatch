import { createStore, applyMiddleware } from 'redux'
import createLogger from 'redux-logger'
import reducer from './reducers'

const middlewares = []

/* global process:true*/
if (process.env.NODE_ENV === 'development') {
  middlewares.push(createLogger())
}

export default store = createStore(reducer,
  applyMiddleware(
    ...middlewares
  )
)