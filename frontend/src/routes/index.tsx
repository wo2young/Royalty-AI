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
import RequireAuth from "@/shared/auth/RequireAuth"
import { BrandDetailPage, BrandsPage } from "@/features/brand"

export const router = createBrowserRouter([
  // ✅ 메인 레이아웃
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <LandingPage /> },

      // 🔒 로그인 필요
      {
        element: <RequireAuth />,
        children: [
          { path: "analysis", element: <AnalysisPage /> },
          { path: "recommend", element: <RecommendationPage /> },
          { path: "trademarks", element: <TrademarkListPage /> },
          { path: "mypage", element: <MyPage /> },
          { path: "mypage/bookmark", element: <BookmarksPage /> },
          { path: "mypage/brand", element: <BrandsPage /> },
          { path: "mypage/brand/:id", element: <BrandDetailPage /> },
        ],
      },
    ],
  },

  // 🔁 /login → /auth/login
  {
    path: "/login",
    element: <Navigate to="/auth/login" replace />,
  },

  // 🔐 인증
  {
    path: "/auth",
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignUpPage /> },
    ],
  },

  // 🔑 OAuth
  {
    path: "/oauth/kakao/callback",
    element: <KakaoCallbackPage />,
  },

  // 🔑 비밀번호 재설정
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
])
