// scripts/messageStats.js
import { getToken } from "./auth.js";

export async function updateMessageStats() {
  const token = getToken();
  const totalSpan = document.getElementById("totalMessages");
  const unreadSpan = document.getElementById("unreadMessages");

  if (token && totalSpan && unreadSpan) {
    try {
      const res = await fetch("http://localhost:3000/api/messages/inbox", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const messages = await res.json();

      const totalCount = messages.length;
      const unreadCount = messages.filter((msg) => !msg.isRead).length;

      totalSpan.textContent = totalCount;
      unreadSpan.textContent = unreadCount;
    } catch (err) {
      console.error("Failed to fetch message stats:", err);
    }
  }
}
