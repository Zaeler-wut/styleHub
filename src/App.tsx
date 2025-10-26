import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import './App.css'

function App() {

  return (
    <div className="min-h-dvh w-full">
      <Navbar />
      <main className="min-h-[calc(100dvh-64px)]">
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* <Route path="/category" element={<CategoryPage />} />
          <Route path="/category/:id" element={<CategoryPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} /> */}
        </Routes>
      </main>
    </div>
  );
}

export default App
