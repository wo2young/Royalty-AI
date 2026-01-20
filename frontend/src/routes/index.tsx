import { createBrowserRouter } from "react-router-dom"
import { AppLayout } from "@/shared/components/layout/AppLayout"
import { LandingPage } from "@/features/landing"
import { AnalysisPage } from "@/features/analysis"
import { LoginPage, SignUpPage } from "@/features/auth"
import { RecommendationPage } from "@/features/recommendation"
import { TrademarkListPage } from "@/features/trademark"
import { MyPage } from "@/features/mypage"
import ErrorPage from "@/shared/page/ErrorPage"
import { BookmarksPage } from "@/features/bookmark/page/BookmarkPage"
import { BrandsPage } from "@/features/brand/page/BrandPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <ErrorPage />, // 에러 발생 시 보여줄 페이지
    children: [
      { index: true, element: <LandingPage /> },
      { path: "analysis", element: <AnalysisPage /> },
      { path: "recommend", element: <RecommendationPage /> },
      { path: "trademarks", element: <TrademarkListPage /> },
      { path: "mypage", element: <MyPage /> },
      { path: "mypage/bookmark", element: <BookmarksPage /> },
      { path: "mypage/brand", element: <BrandsPage /> },
    ],
  },
  {
    path: "/auth",
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignUpPage /> },
    ],
  },
])
