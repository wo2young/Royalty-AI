import clsx from "clsx";

export default function NotificationItem({ notification, onRead }: any) {
  const { notificationId, isRead, matchType, imageSimilarity, textSimilarity } =
    notification;

  const message = (() => {
    if (matchType === "IMAGE")
      return `⚠️ 로고 유사도 ${Math.round(imageSimilarity * 100)}% 감지`;
    if (matchType === "TEXT")
      return `⚠️ 상호명 유사도 ${Math.round(textSimilarity * 100)}% 감지`;
    return "⚠️ 유사 상표 감지";
  })();

  return (
    <div
      onClick={() => !isRead && onRead(notificationId)}
      className={clsx(
        "px-4 py-3 cursor-pointer border-b text-sm",
        !isRead && "bg-muted",
        "hover:bg-accent"
      )}
    >
      <p>{message}</p>
    </div>
  );
}
