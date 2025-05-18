import { useState, useEffect } from "react";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("");
  const [categories, setCategories] = useState("");

  useEffect(() => {
    const welcomeMessage = { sender: "bot", text: "Welcome!" };
    const selectionMessage = {
      sender: "bot",
      type: "selection", 
      options: [
        { label: "Product Questions", value: "product" },
        { label: " Support", value: "support" },
        { label: "I have symptoms", value: "chat" }
      ]
    };
  
    setMessages([welcomeMessage, selectionMessage]);
  }, []);

  const optionsMsg = {
    sender: "bot",
    type: "useroptions", 
    options: [
    "Fitness",
    "Energy",
    "Immunity",
    "Skin Health",
    "Detox",
   "Brain Health",
       "Gut Health",
       "Healthy-Aging",
       "Stress Relief",
       "Recovery",
       "Heart Health",
       "Joint and Bone"
  ]};





  
  const sendMessage = async () => {
    if (!input.trim()) return;
  
    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
  
    setInput("");
  
    //fetch response
    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
        category: categories || ""
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
  



  const handleSelection = (value) => {
    setMode(value); 
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: value },
      ...(mode === "product" ? [optionsMsg] : [
        { sender: "bot", text: "Cool! Let me connect you with support..." }
      ])
    ]);
  };

  const handleCategories = (value) => {
    setCategories(value); 
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: value },
      { sender: "bot", text: "great! How may I help you regarding products?" },
    ]);
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
            


          {messages.map((msg, i) => {
  if (msg.type === "selection") {
    return (
      <div key={i} style={{ marginBottom: 8 }}>
        <div
          style={{
            backgroundColor: "#eee",
            color: "#333",
            padding: "8px 12px",
            borderRadius: 16,
            maxWidth: "70%",
            fontSize: 14,
          }}
        >
          <p style={{ marginBottom: 8 }}>What can I help you with?</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {msg.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelection(opt.value)}
                style={{
                  padding: "6px 10px",
                  borderRadius: "12px",
                  border: "1px solid #2563eb",
                  backgroundColor: "#fff",
                  color: "#2563eb",
                  cursor: "pointer",
                  fontSize: "13px"
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }



  if (msg.type === "useroptions") {
    return (
      <div key={i} style={{ marginBottom: 8, display: "flex", justifyContent: "flex-start" }}>
        <div
          style={{
            backgroundColor: "#f1f5f9", // soft light blue-gray
            padding: "10px",
            borderRadius: "16px",
            maxWidth: "75%",
            fontSize: 14,
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div style={{ fontWeight: "bold", color: "#2563eb" }}>
            Choose a category:
          </div>
  
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            {msg.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() =>handleCategories(opt)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "9999px",
                  border: "1px solid #2563eb",
                  backgroundColor: "#fff",
                  color: "#2563eb",
                  cursor: "pointer",
                  fontSize: "13px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#2563eb";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#fff";
                  e.currentTarget.style.color = "#2563eb";
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }
  







  return (
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
  );
})}




            
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
