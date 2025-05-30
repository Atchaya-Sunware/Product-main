import "./App.css";
import LandingPage from "./components/LandingPage";
import Home from "./components/home/Home"
import ViewProduct from "./components/ViewProduct";
import SearchResult from "./components/SearchResult";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./components/CartContext";


function App() {
  return (
    <div className="App">
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/viewProduct" element={<ViewProduct />} />
            <Route path="/search" element={<SearchResult />} />
            <Route path="/home" element={<Home />} />  {/* Home page route */}
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </div>
  );
}
export default App;