import { useState } from "react";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  
  const sendMessage = async () => {
    if (!input.trim()) return;
  
    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
  
    setInput("");
  
    // Now fetch response
    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });
  
      const data = await response.json();
      const botMessage = { sender: "bot", text: data.answer };
  
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error: Could not reach server." },
      ]);
    }
  };
  

  return (
    <>
     
      <div style={{ position: "fixed", bottom: 16, right: 16, zIndex: 1000 }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            backgroundColor: "#2563eb",
            color: "white",
            padding: "10px 16px",
            borderRadius: "9999px",
            border: "none",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {isOpen ? "×" : "Chat"}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            right: 16,
            width: 320,
            maxHeight: "75vh",
            background: "white",
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 1000,
          }}
        >
          <div style={{ background: "#2563eb", color: "white", padding: "12px", fontWeight: "bold" }}>AI Assistant</div>
          <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.sender === "user" ? "flex-end" : "flex-start", marginBottom: 8 }}>
                <div
                  style={{
                    backgroundColor: msg.sender === "user" ? "#2563eb" : "#eee",
                    color: msg.sender === "user" ? "white" : "#333",
                    padding: "8px 12px",
                    borderRadius: 16,
                    maxWidth: "70%",
                    fontSize: 14,
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", borderTop: "1px solid #ddd", padding: 8 }}>
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              style={{
                flex: 1,
                padding: 8,
                fontSize: 14,
                border: "1px solid #ccc",
                borderRadius: "8px 0 0 8px",
                outline: "none",
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                backgroundColor: "#2563eb",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: "0 8px 8px 0",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
