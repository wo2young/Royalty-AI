export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <p className="text-sm text-muted-foreground">
          © 2026 <span className="font-medium text-foreground">Royalty-AI</span>
          . All rights reserved.
        </p>

        <div className="flex gap-4 text-sm text-muted-foreground">
          <a href="#" className="hover:underline underline-offset-4">
            개인정보처리방침
          </a>
          <a href="#" className="hover:underline underline-offset-4">
            이용약관
          </a>
        </div>
      </div>
    </footer>
  )
}
