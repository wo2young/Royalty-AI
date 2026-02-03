import { RouterProvider } from "react-router-dom"
import { router } from "./routes"
import { Toaster } from "sonner"

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          style: { borderRadius: "12px" }, // 팀장님 UI 스타일에 맞춘 라운딩
        }}
      />
      <RouterProvider router={router} />
    </>
  )
}

export default App
