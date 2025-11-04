import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import FavoritesPage from "./pages/FavoritePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";
import "./App.css";

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin"); // ซ่อนทุกหน้าใต้ /admin

  return (
    <div className="min-h-dvh w-full">
      {!isAdminRoute && <Navbar />}

      <main className={isAdminRoute ? "min-h-dvh" : "min-h-[calc(100dvh-64px)]"}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductPage />} />
          <Route path="/products/:id" element={<ProductPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={<AdminPage />} />
          {/* ถ้ามีซับเพจในแอดมิน: <Route path="/admin/*" element={<AdminPage />} /> */}
        </Routes>
      </main>
    </div>
  );
}

export default App;
