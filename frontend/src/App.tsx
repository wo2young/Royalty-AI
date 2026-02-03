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
          style: { borderRadius: "12px" },
        }}
      />
      <RouterProvider router={router} />
    </>
  )
}

export default App
