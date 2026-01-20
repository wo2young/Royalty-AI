import { createBrowserRouter, Navigate } from "react-router-dom"
import { AppLayout } from "@/shared/components/layout/AppLayout"
import { LandingPage } from "@/features/landing"
import { AnalysisPage } from "@/features/analysis"
import { LoginPage, SignUpPage } from "@/features/auth"
import { RecommendationPage } from "@/features/recommendation"
import { TrademarkListPage } from "@/features/trademark"
import { MyPage } from "@/features/mypage"
import ErrorPage from "@/shared/page/ErrorPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "analysis", element: <AnalysisPage /> },
      { path: "recommend", element: <RecommendationPage /> },
      { path: "trademarks", element: <TrademarkListPage /> },
      { path: "mypage", element: <MyPage /> },
    ],
  },

  // 🔥 핵심: /login 접근 방어
  {
    path: "/login",
    element: <Navigate to="/auth/login" replace />,
  },

  {
    path: "/auth",
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignUpPage /> },
    ],
  },
])
