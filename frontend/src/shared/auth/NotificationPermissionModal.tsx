type Props = {
  onClose: () => void
  onGranted: () => void | Promise<void>
}

export default function NotificationPermissionModal({
  onClose,
  onGranted,
}: Props) {
  // 오늘 날짜 (YYYY-MM-DD)
  const today = new Date().toISOString().slice(0, 10)


  const handleAllow = async () => {

            // 🚫 이미 차단된 상태면 안내만 띄우고 종료
       if (Notification.permission === "denied") {
          alert(
            "브라우저에서 알림이 차단되어 있습니다.\n\n" +
            "사이트를 허용으로 변경해주세요" 
          )
          onClose()
          return
        }
    try {
      const permission = await Notification.requestPermission()

      if (permission === "granted") {
        // 허용 성공 → 오늘 다시 안 띄움
        localStorage.setItem(
          "notification_modal_hidden_date",
          today
        )
        await onGranted()
        onClose()
      }
    } catch (e) {
      console.error("알림 권한 요청 실패", e)
    }
  }

  const handleCloseToday = () => {
    localStorage.setItem(
      "notification_modal_hidden_date",
      today
    )
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-[360px] rounded-lg bg-white p-6 shadow-lg">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <h2 className="mb-2 text-lg font-semibold">
          알림 권한이 필요해요
        </h2>

        <p className="mb-4 text-sm text-gray-600">
          로그인 알림과 중요한 공지를 받기 위해
          알림 허용이 필요합니다.
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleAllow}
            className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            알림 허용
          </button>

          <button
            onClick={handleCloseToday}
            className="w-full rounded px-4 py-2 text-sm text-gray-500 hover:bg-gray-100"
          >
            오늘 하루 보지 않기
          </button>
        </div>
      </div>
    </div>
  )
}
