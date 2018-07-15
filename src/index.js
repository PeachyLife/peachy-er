import React from 'react'
import ReactDOM from 'react-dom'
import App from './app.js'

ReactDOM.render(<App />, document.getElementById('app'))
if (module.hot) {
  module.hot.accept('./app', () => {
    ReactDOM.render(<App />, document.getElementById('app'))
  })
}
