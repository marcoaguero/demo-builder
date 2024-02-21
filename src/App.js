import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./containers/Home";
import PurchaseSuccess from "./containers/PurchaseSuccess";
import { FastSpringProvider } from "./store/FastSpringContext";

function App() {
  return (
    <div className="App d-flex flex-column min-vh-100">
      <BrowserRouter>
        <FastSpringProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            {/* <Route path="/:productId" element={<Details />} /> */}
            <Route path="/purchase_success" element={<PurchaseSuccess />} />
          </Routes>
          <Footer />
        </FastSpringProvider>
      </BrowserRouter>
    </div>
  );
}
export default App;
