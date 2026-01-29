import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Users } from "lucide-react"
import { useState } from "react"
import { ProfileEditModal } from "./MyProfileEditModal"

export default function MyProfileSidebar() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  return (
    <aside>
      <Card className="shadow-sm">
        <CardContent className="pt-8 pb-6 space-y-8">
          <div className="flex flex-col items-center space-y-5">
            <div className="text-center space-y-1.5">
              <h2 className="text-xl font-bold text-foreground">홍길동</h2>
              <p className="text-sm text-muted-foreground">hong@example.com</p>
            </div>
            <Button
              variant="outline"
              className="w-full gap-2 h-10 bg-transparent"
              onClick={() => setIsModalOpen(true)}
            >
              <Users className="w-4 h-4" />
              개인정보수정
            </Button>
          </div>
        </CardContent>
      </Card>

      <ProfileEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentEmail="hong@example.com"
      />
    </aside>
  )
}
