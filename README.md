# 🧠 Cymbiotika AI Chatbot

A full-stack AI chatbot built for **Cymbiotika**, capable of:
- Answering product-specific questions using local embeddings
- Routing support queries
- Providing general wellness chat via Llama 3

Built with:
- 🐍 **FastAPI** + **LangGraph** (Python backend)
- 🧠 **Chroma** + **MiniLM Embeddings**
- 🦙 **Llama 3** via [Ollama](https://ollama.com/)
- ⚛️ **React + Vite** (frontend)

---

## 🚀 Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/your-username/cymbiotika-ai-chatbot.git
cd cymbiotika-ai-chatbot

2. Set up the backend
bash
Copy
Edit
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
