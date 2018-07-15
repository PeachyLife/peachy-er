import React from 'react'
import ReactDOM from 'react-dom'
import { App } from './app'

it('renders without crashing', () => {
  const div = document.createElement('div')
  Object.defineProperty(window.URL, 'createObjectURL', {
    writable: true,
    value: ''
  })
  ReactDOM.render(<App />, div)
})
