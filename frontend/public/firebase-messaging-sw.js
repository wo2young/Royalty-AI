importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDNLxNtEGIy4QtE6qT8SFUJP6-CZ4XKvLM",
  authDomain: "royalty-push.firebaseapp.com",
  projectId: "royalty-push",
  messagingSenderId: "1064350770555",
  appId: "1:1064350770555:web:dbecfbfe5e6e7e6e47c9de",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] 백그라운드 메시지", payload);

  const title = payload?.notification?.title ?? "알림";
  const body = payload?.notification?.body ?? "";

  self.registration.showNotification(title, {
    body,
    icon: "/logo.svg",
  });
});
