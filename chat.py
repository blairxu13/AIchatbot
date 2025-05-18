from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.llms import Ollama
from langchain.chains import RetrievalQA

# Load embeddings + LLM
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
llm = Ollama(model="mistral")

# Load vectorstore from disk
vectorstore = Chroma(
    persist_directory="./chroma_db",
    embedding_function=embeddings
)

# Init FastAPI
app = FastAPI()

# Allow CORS from anywhere (for dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request schema
class Question(BaseModel):
    question: str
    category: str = ""  # make category optional/fallback

@app.post("/chat")
async def chat(req: Question):
    # Build retriever with or without filter
    if req.category:
        retriever = vectorstore.as_retriever(
            search_kwargs={
                "k": 5,
                "filter": {"category": req.category}
            }
        )
    else:
        retriever = vectorstore.as_retriever()  # no filter

    # Create QA chain
    qa_chain = RetrievalQA.from_chain_type(
        llm=llm,
        retriever=retriever
    )

    # Get answer
    answer = qa_chain.run(req.question)
    return {"answer": answer}
