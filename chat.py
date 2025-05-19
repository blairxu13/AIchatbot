# chat.py  ---------------------------------------------------------------
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Annotated, TypedDict

from langgraph.graph.message import add_messages
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.llms import Ollama
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA
from langgraph.graph import StateGraph, END

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


custom_prompt = PromptTemplate.from_template("""
You are a helpful product assistant for Cymbiotika, a wellness supplement brand.

Always answer like a friendly expert who knows the products deeply.  
If a product fits, explain **why it's helpful**, **how to take it**, and **when someone might use it**.  
Be confident and engaging, not robotic.

Question: {question}
Context: {context}

Answer:
""")

embeddings   = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
vectorstore  = Chroma(persist_directory="./chroma_db", embedding_function=embeddings)
llm          = Ollama(model="mistral")


class Question(BaseModel):
    question: str
    category: str = ""
    mode: str = "chat"


def router_node(state):
    mode = state.get("mode", "chat")
    if mode == "product":
        return {"__next__": "product"}
    elif mode == "support":
        return {"__next__": "support"}
    return {"__next__": "chat"}


def product_node(state):
    question  = state["question"]
    category  = state.get("category", "")

    retriever = vectorstore.as_retriever(
        search_kwargs={
            "k": 5,
            "filter": {"category": category} if category else None,
        }
    )

    qa_chain   = RetrievalQA.from_chain_type(
        llm=llm,
        retriever=retriever,
        chain_type_kwargs={"prompt": custom_prompt},
    )

    qa_output  = qa_chain.invoke(question)   
    answer_txt = qa_output["result"]         

    return {
        "response": [
            {
                "role": "assistant",
                "content": answer_txt
            }
        ]
    }

def support_node(state):
    return {
        "response": [
            {
                "role": "assistant",
                "content": "Sure! Please email support@cymbiotika.com or visit our Help Center at cymbiotika.com/support."
            }
        ]
    }

def chat_node(state):
    answer_txt = llm.invoke(state["question"])
    return {
        "response": [
            {
                "role": "assistant",
                "content": answer_txt
            }
        ]
    }


class ChatState(TypedDict):
    question: str
    category: str
    mode: str
    response: Annotated[list, add_messages]

builder = StateGraph(ChatState)
builder.add_node("router",  router_node)
builder.add_node("product", product_node)
builder.add_node("support", support_node)
builder.add_node("chat",    chat_node)

builder.set_entry_point("router")
builder.add_edge("router",  "product")
builder.add_edge("router",  "support")
builder.add_edge("router",  "chat")
builder.add_edge("product", END)
builder.add_edge("support", END)
builder.add_edge("chat",    END)

graph = builder.compile()


@app.post("/chat")
async def chat(req: Question):
    result = graph.invoke(
        {
            "question": req.question,
            "category": req.category,
            "mode":     req.mode,
        }
    )

    first_msg = result["response"][0]
    # first_msg is AIMessage after LangGraph converts it
    answer_txt = first_msg.content if hasattr(first_msg, "content") else first_msg["content"]

    return {"answer": answer_txt}
