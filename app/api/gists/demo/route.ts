"use client"

import { NextResponse } from "next/server"

const demoGists = [
  {
    _id: "demo-js-1",
    userId: "demo",
    user_fullName: "Demo User",
    gistViews: 1250,
    gistDescription: "JavaScript Hello World and Basic Functions",
    fileNameWithExtension: "hello.js",
    gistCode: `// JavaScript Hello World
console.log("Hello, World! 🌍");

// Basic function example
function greetUser(name) {
    return \`Hello, \${name}! Welcome to JavaScript.\`;
}

// Arrow function
const addNumbers = (a, b) => a + b;

// Example usage
const userName = "Developer";
console.log(greetUser(userName));
console.log("Sum of 5 + 3 =", addNumbers(5, 3));

// Working with arrays
const fruits = ["apple", "banana", "orange"];
fruits.forEach(fruit => console.log(\`I love \${fruit}s!\`));`,
    sharedFile: [],
    visibility: "public",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    _id: "demo-python-1",
    userId: "demo",
    user_fullName: "Demo User",
    gistViews: 890,
    gistDescription: "Python Basics - Variables, Functions, and Loops",
    fileNameWithExtension: "basics.py",
    gistCode: `# Python Hello World
print("Hello, World! 🐍")

# Variables and data types
name = "Python Developer"
age = 25
is_programmer = True
favorite_languages = ["Python", "JavaScript", "Go"]

# Function definition
def greet_user(user_name, user_age):
    return f"Hello {user_name}! You are {user_age} years old."

# Class example
class Calculator:
    def add(self, a, b):
        return a + b
    
    def multiply(self, a, b):
        return a * b

# Example usage
print(greet_user(name, age))

calc = Calculator()
print(f"5 + 3 = {calc.add(5, 3)}")
print(f"4 * 7 = {calc.multiply(4, 7)}")

# Loop through list
for language in favorite_languages:
    print(f"I enjoy coding in {language}")`,
    sharedFile: [],
    visibility: "public",
    createdAt: new Date("2024-01-14"),
    updatedAt: new Date("2024-01-14"),
  },
  {
    _id: "demo-react-1",
    userId: "demo",
    user_fullName: "Demo User",
    gistViews: 675,
    gistDescription: "React Component - Simple Counter with Hooks",
    fileNameWithExtension: "Counter.jsx",
    gistCode: `import React, { useState } from 'react';

// Simple Counter Component using React Hooks
function Counter() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);

  const increment = () => setCount(count + step);
  const decrement = () => setCount(count - step);
  const reset = () => setCount(0);

  return (
    <div className="counter">
      <h2>Counter: {count}</h2>
      
      <div className="controls">
        <button onClick={decrement}>-</button>
        <button onClick={increment}>+</button>
        <button onClick={reset}>Reset</button>
      </div>

      <div className="step-control">
        <label>
          Step: 
          <input 
            type="number" 
            value={step} 
            onChange={(e) => setStep(Number(e.target.value))}
            min="1"
          />
        </label>
      </div>

      <style jsx>{\`
        .counter { text-align: center; padding: 20px; }
        .controls button { margin: 0 5px; padding: 10px 15px; }
        .step-control { margin-top: 15px; }
      \`}</style>
    </div>
  );
}

export default Counter;`,
    sharedFile: [],
    visibility: "public",
    createdAt: new Date("2024-01-13"),
    updatedAt: new Date("2024-01-13"),
  },
]

export async function GET() {
  try {
    console.log("Demo gists API called, returning:", demoGists.length, "gists")
    return NextResponse.json(demoGists)
  } catch (error) {
    console.error("Error fetching demo gists:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
