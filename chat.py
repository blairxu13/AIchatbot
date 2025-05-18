from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.llms import HuggingFacePipeline
from transformers import pipeline
from langchain.chains import RetrievalQA
from langchain_community.llms import Ollama
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Load embeddings
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
llm = Ollama(model="mistral")
# Load existing vector store from disk
vectorstore = Chroma(
    persist_directory="./chroma_db",
    embedding_function=embeddings
)

# Set up retriever + local LLM
retriever = vectorstore.as_retriever()


# Build the QA chain
qa_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=retriever
)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Question(BaseModel):
    question: str

@app.post("/chat")
async def chat(req: Question):
    answer = qa_chain.run(req.question)
    return { "answer": answer }
    
# print(" Checking if anything is inside Chroma:")
# print(vectorstore._collection.count())

# response = qa_chain.run("Which Cymbiotika product helps with Boost athletic performance, strength, and recovery time?")
# print(response)

# docs = retriever.get_relevant_documents("What helps with hormone balance?")
# print(f"🔍 Retrieved {len(docs)} chunks:")


