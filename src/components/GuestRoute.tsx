import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../lib/auth";

type GuestRouteProps = {
  children: ReactNode;
};

/** Rotas públicas: redireciona usuários já autenticados para o app. */
export default function GuestRoute({ children }: GuestRouteProps) {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
