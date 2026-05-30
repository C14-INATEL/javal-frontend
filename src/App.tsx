import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import GuestRoute from "./components/GuestRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Machines from "./pages/Machines";
import MachinesList from "./pages/MachinesList";
import ProductNew from "./pages/ProductNew";
import ProductsList from "./pages/ProductsList";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />
        <Route
          path="/machines"
          element={
            <ProtectedRoute>
              <MachinesList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/machines/new"
          element={
            <ProtectedRoute>
              <Machines />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products/new"
          element={
            <ProtectedRoute>
              <ProductNew />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
