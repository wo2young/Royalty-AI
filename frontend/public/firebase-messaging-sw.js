importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "네_API_KEY",
  authDomain: "네_AUTH_DOMAIN",
  projectId: "네_PROJECT_ID",
  messagingSenderId: "네_SENDER_ID",
  appId: "네_APP_ID",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] 백그라운드 메시지", payload);

  self.registration.showNotification(
    payload.notification.title,
    {
      body: payload.notification.body,
      icon: "/logo.svg",
    }
  );
});
