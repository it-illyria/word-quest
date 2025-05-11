import React, {useState} from "react";
import WelcomeScreen from "./components/Welcome";
import Quiz from "./components/Quiz";
import './index.css';

function App() {
    const [started, setStarted] = useState(false);

    return (
        <div className="font-sans">
            {started ? <Quiz/> : <WelcomeScreen onStart={() => setStarted(true)}/>}
        </div>
    );
}

export default App;
