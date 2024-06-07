import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home  from "./components/Home";
import Front  from "./components/Front";

function App() {

  return (
    <div>
      
    <BrowserRouter>
    <Navbar />
      <Routes>
        <Route path="/" element={<Front />} />
        <Route path="/home" element={<Home />} />

       </Routes>
    </BrowserRouter>
  </div>
  )
}

export default App
