import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import { useAuth } from "./context/AuthContext";

function App() {
  const auth = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={auth?.user ? <Navigate to="/chat" /> : <Login />} 
      />
      <Route 
        path="/signup" 
        element={auth?.user ? <Navigate to="/chat" /> : <Signup />} 
      />
      <Route 
        path="/chat" 
        element={auth?.user ? <Chat /> : <Navigate to="/login" />} 
      />
      <Route path="/" element={<Navigate to={auth?.user ? "/chat" : "/signup"} />} />
    </Routes>
  );
}

export default App;