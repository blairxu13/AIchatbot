import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ChatBot from "./chatwindow";

function App() {
  const [count, setCount] = useState(0)
  const question = "what's product?";
  return (
    <div>

      <ChatBot />
       welcome to Cymbiotika AI chatbot Website!

    </div>
  )
}

export default App
