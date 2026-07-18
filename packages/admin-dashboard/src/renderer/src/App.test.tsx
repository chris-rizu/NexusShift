import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Simple placeholder pages
const Dashboard = () => <div className="p-8 bg-gray-50 min-h-screen"><h1 className="text-2xl font-bold">Dashboard</h1></div>;
const Workers = () => <div className="p-8 bg-gray-50 min-h-screen"><h1 className="text-2xl font-bold">Workers</h1></div>;
const Analytics = () => <div className="p-8 bg-gray-50 min-h-screen"><h1 className="text-2xl font-bold">Analytics</h1></div>;

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <nav className="bg-gray-900 text-white p-4">
          <div className="flex gap-4">
            <a href="/" className="hover:underline">Dashboard</a>
            <a href="/workers" className="hover:underline">Workers</a>
            <a href="/analytics" className="hover:underline">Analytics</a>
          </div>
        </nav>
        <main className="p-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/workers" element={<Workers />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
