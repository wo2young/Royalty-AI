import { createBrowserRouter, Navigate } from "react-router-dom"
import { AppLayout } from "@/shared/components/layout/AppLayout"
import { LandingPage } from "@/features/landing"
import { AnalysisPage } from "@/features/analysis"
import { LoginPage, SignUpPage, ResetPasswordPage } from "@/features/auth"
import { RecommendationPage } from "@/features/recommendation"
import { TrademarkListPage } from "@/features/trademark"
import { MyPage } from "@/features/mypage"
import ErrorPage from "@/shared/page/ErrorPage"
import { BookmarksPage } from "@/features/bookmark/page/BookmarkPage"
import KakaoCallbackPage from "@/features/auth/page/KakaoCallbackPage"

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
      { path: "mypage/bookmark", element: <BookmarksPage /> },
    ],
  },
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
  {
    path: "/oauth/kakao/callback",
    element: <KakaoCallbackPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
])
