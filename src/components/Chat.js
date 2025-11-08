"use client";

import { useState, useRef, useEffect } from "react";

/**
 * Chat component for the Mosoly Dental reception.  
 * Displays a conversation window where the patient can send messages to the clinic.  
 * Messages are also POSTed to a Make.com webhook via an internal API route.
 */
export default function Chat() {
  // Initialize chat with a friendly greeting from the reception.
  const [messages, setMessages] = useState([
    {
      sender: "reception",
      text: "Üdvözöljük a Mosoly Dental rendelőben! Miben segíthetünk?",
    },
  ]);
  const [input, setInput] = useState("");
  const messageEndRef = useRef(null);

  // Scroll the message area to the bottom whenever a new message is added.
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /**
   * Sends the current input as a message.  
   * Adds it to the chat locally and forwards it to the server API to reach the webhook.
   */
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    // Append the user's message to the chat.
    setMessages((prev) => [...prev, { sender: "user", text: trimmed }]);
    setInput("");
    // Call the API route which relays the message to Make.com.
    try {
      await fetch("/api/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmed }),
      });
    } catch (err) {
      // We log the error but don't surface it to the user to keep the UI clean.
      console.error("Hiba az üzenet küldésénél:", err);
    }
  };

  /**
   * Handles keyboard interactions.  
   * Allows sending the message with Enter while enabling line breaks with Shift+Enter.
   */
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-wrapper">
      {/* Header with clinic information */}
      <div className="chat-header">
        <h1>Mosoly Dental</h1>
        <p>Budapest, Példa u. 12. &bull; Nyitva: H–P 8–17</p>
      </div>
      {/* Scrollable chat area */}
      <div className="message-area">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {/* Dummy element to ensure scroll to bottom */}
        <div ref={messageEndRef} />
      </div>
      {/* Input controls */}
      <div className="input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Írja ide üzenetét..."
          rows={1}
        />
        <button onClick={handleSend}>Küldés</button>
      </div>
    </div>
  );
}
