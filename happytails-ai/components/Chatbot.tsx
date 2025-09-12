"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/Chatbot.module.css";

type Message = {
  id: number;
  from: "user" | "bot";
  text: string;
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, from: "bot", text: "Hola 👋 ¿En qué puedo ayudarte hoy?" },
  ]);
  const [input, setInput] = useState("");
  const nextId = useRef(1);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  function toggleOpen() {
    setIsOpen((v) => !v);
  }

  function sendMessage(text?: string) {
    const trimmed = (text ?? input).trim();
    if (!trimmed) return;

    const userMsg: Message = { id: nextId.current++, from: "user", text: trimmed };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    // call server API that proxies to Mistral (or returns a mock when not configured)
    (async () => {
      try {
    const resp = await fetch("/api/mistral", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
      messages: [...messages.map((mm) => ({ role: mm.from === "user" ? "user" : "assistant", content: mm.text })), { role: "user", content: trimmed }],
          }),
        });
        const data = await resp.json();
        const botText = data?.text ?? (data?.raw ? JSON.stringify(data.raw) : "(sin respuesta)");
        const botMsg: Message = { id: nextId.current++, from: "bot", text: String(botText) };
        setMessages((m) => [...m, botMsg]);
      } catch (_e: unknown) { // Changed 'e' to '_e' to mark as unused, and type to unknown
        const botMsg: Message = { id: nextId.current++, from: "bot", text: "Error al conectar con el servidor." };
        setMessages((m) => [...m, botMsg]);
      }
    })();
  }

  return (
    <div>
      {/* Chat window */}
      <div
        className={`${styles.window} ${isOpen ? styles.open : ""}`}
        role="dialog"
        aria-hidden={!isOpen}
      >
        <div className={styles.header}>
          <div className={styles.title}>Chatbot</div>
          <button aria-label="Cerrar chat" className={styles.close} onClick={toggleOpen}>
            ×
          </button>
        </div>

        <div className={styles.messages} ref={scrollRef}>
          {messages.map((m) => (
            <div key={m.id} className={m.from === "bot" ? styles.msgBot : styles.msgUser}>
              {m.from === "bot" && <span className={styles.botIcon}>🤖</span>} {/* Icon for bot messages */}
              <div className={styles.msgText}>{m.text}</div>
            </div>
          ))}
        </div>

        <div className={styles.inputRow}>
          <input
            aria-label="Escribe un mensaje"
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { // Explicitly type 'e'
              if (e.key === "Enter") sendMessage();
            }}
            placeholder="Escribe tu mensaje..."
          />
          <button className={styles.send} onClick={() => sendMessage()} aria-label="Enviar">
            ➤
          </button>
        </div>
      </div>

      {/* Floating bubble */}
      <button
        className={`${styles.bubble} ${isOpen ? styles.bubbleOpen : ""}`}
        aria-expanded={isOpen}
        aria-label="Abrir chat"
        onClick={toggleOpen}
      >
        <span className={styles.bubbleIcon}>💬</span>
      </button>
    </div>
  );
}
