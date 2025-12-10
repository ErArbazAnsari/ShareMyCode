export const demoGists = [
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
    return f"Hello, {user_name}! You are {user_age} years old."

# Using the function
print(greet_user(name, age))

# Dictionary (similar to JSON)
user_info = {
    "name": "John",
    "language": "Python",
    "years": 3
}
print(f"Developer: {user_info['name']}")

# List operations
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
    <div style={styles.container}>
      <h1>Counter App</h1>
      <div style={styles.display}>
        <h2>Count: {count}</h2>
      </div>
      <div style={styles.controls}>
        <button onClick={decrement}>-</button>
        <button onClick={reset}>Reset</button>
        <button onClick={increment}>+</button>
      </div>
      <div style={styles.stepControl}>
        <label>
          Step:
          <input
            type="number"
            value={step}
            onChange={(e) => setStep(Number(e.target.value))}
            style={styles.input}
          />
        </label>
      </div>
      <style>{
        \`.container { text-align: center; padding: 20px; }
        .display { background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .controls button { margin: 0 5px; padding: 10px 15px; }
        .step-control { margin-top: 15px; }\`
      }</style>
    </div>
  );
}

export default Counter;`,
        sharedFile: [],
        visibility: "public",
        createdAt: new Date("2024-01-13"),
        updatedAt: new Date("2024-01-13"),
    },
];
