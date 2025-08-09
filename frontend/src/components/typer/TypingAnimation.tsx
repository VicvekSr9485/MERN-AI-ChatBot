import React from 'react'
import { TypeAnimation } from 'react-type-animation';

const TypingAnimation = () => {
  return (
    <TypeAnimation
  sequence={[
    // Same substring at the start will only be typed once, initially
    'Chat With Your OWN AI 👨🏻‍💻🦾🚀',
    1000,
    'Built With Gemini 🤖',
    2000,
    'Your Own Customized Gemini AI 🤖',
    1500,
  ]}
  speed={50}
  style={{ fontSize: '60px', color:"white", display:"inline-block", textShadow:"1px 1px 20px #000", }}
  repeat={Infinity}
/>
  )
}

export default TypingAnimation
