import './App.css'
import { showCustomToast } from './components/CustomToast'
import { useState } from 'react';
import { TestQueryErrorButton } from './components/TestQueryErrorButton';
import { ErrorThrower } from './components/ErrorThrower';

function App() {
  const [showError, setShowError] = useState(false);
  const throwError = () => {
    setShowError(true);
  };

  return (
    <>
      <h1>Vite + React</h1>
      <div className="card">
        <button style={{ marginLeft: '12px' }} onClick={showCustomToast}>
          Show Custom Toast
        </button>
        <button className="ml-4 bg-red-600 text-white px-4 py-2 rounded" onClick={throwError}>
          Throw Error (Test Boundary)
        </button>
      </div>
      <TestQueryErrorButton />
      {showError && <ErrorThrower />}
    </>
  );
}

export default App
