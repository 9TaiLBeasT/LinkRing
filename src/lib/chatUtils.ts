// Utility functions for chat functionality

/**
 * Check if a specific message is expired (older than 16 hours)
 * Individual messages expire 16 hours after their creation
 */
export function isMessageExpired(messageCreatedAt: string): boolean {
  const messageCreated = new Date(messageCreatedAt);
  const expiryTime = new Date(messageCreated.getTime() + 16 * 60 * 60 * 1000); // 16 hours
  const now = new Date();

  return now > expiryTime;
}

/**
 * Calculate time remaining until a message expires
 * Returns milliseconds remaining, or 0 if expired
 */
export function getMessageTimeRemaining(messageCreatedAt: string): number {
  const messageCreated = new Date(messageCreatedAt);
  const expiryTime = new Date(messageCreated.getTime() + 16 * 60 * 60 * 1000); // 16 hours
  const now = new Date();
  const remaining = expiryTime.getTime() - now.getTime();

  return Math.max(0, remaining);
}

/**
 * Chat is always available now - this function always returns false
 * @deprecated Chat no longer expires at the chat level
 */
export function isChatExpired(linkCreatedAt: string): boolean {
  return false; // Chat is always available
}

/**
 * Chat is always available - returns Infinity
 * @deprecated Chat no longer expires at the chat level
 */
export function getChatTimeRemaining(linkCreatedAt: string): number {
  return Infinity; // Chat is always available
}

/**
 * Format time remaining as HH:MM:SS
 */
export function formatChatTimeRemaining(milliseconds: number): string {
  if (milliseconds <= 0) return "00:00:00";

  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Check if a message can be deleted by the current user
 * Messages can be deleted by their author within 5 minutes of creation
 */
export function canDeleteMessage(
  messageUserId: string,
  currentUserId: string,
  messageCreatedAt: string,
): boolean {
  if (messageUserId !== currentUserId) return false;

  const messageTime = new Date(messageCreatedAt);
  const now = new Date();
  const diffMinutes = (now.getTime() - messageTime.getTime()) / (1000 * 60);

  return diffMinutes <= 5;
}

/**
 * Validate chat message content
 */
export function validateChatMessage(message: string): {
  isValid: boolean;
  error?: string;
} {
  const trimmed = message.trim();

  if (!trimmed) {
    return { isValid: false, error: "Message cannot be empty" };
  }

  if (trimmed.length > 500) {
    return { isValid: false, error: "Message too long (max 500 characters)" };
  }

  // Check for spam patterns (very basic)
  const repeatedChars = /(..)\1{4,}/;
  if (repeatedChars.test(trimmed)) {
    return { isValid: false, error: "Message appears to be spam" };
  }

  return { isValid: true };
}

/**
 * Generate a chat room identifier for real-time subscriptions
 */
export function getChatRoomId(linkId: string): string {
  return `link_chat_${linkId}`;
}

/**
 * Calculate chat activity level based on message count and time
 */
export function getChatActivityLevel(
  messageCount: number,
  linkCreatedAt: string,
): "high" | "medium" | "low" {
  const hoursElapsed =
    (Date.now() - new Date(linkCreatedAt).getTime()) / (1000 * 60 * 60);
  const messagesPerHour = messageCount / Math.max(hoursElapsed, 0.1);

  if (messagesPerHour >= 5) return "high";
  if (messagesPerHour >= 2) return "medium";
  return "low";
}

/**
 * Get chat status display text
 */
export function getChatStatusText(
  isExpired: boolean,
  messageCount: number,
  timeRemaining: string,
): string {
  // Chat never expires now
  if (messageCount === 0) {
    return "No messages • Always available";
  }

  return `${messageCount} message${messageCount !== 1 ? "s" : ""} • Messages auto-delete after 16h`;
}

/**
 * Filter out expired messages from a list
 */
export function filterExpiredMessages<T extends { created_at: string | null }>(
  messages: T[],
): T[] {
  const now = new Date();
  return messages.filter((msg) => {
    if (!msg.created_at) return false;
    const messageTime = new Date(msg.created_at);
    const hoursElapsed =
      (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60);
    return hoursElapsed < 16;
  });
}
