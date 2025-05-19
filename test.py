from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from collections import Counter


embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
vectorstore = Chroma(
    persist_directory="./chroma_db",
    embedding_function=embeddings
)


all_docs = vectorstore.get()
print(f"✅ Total embedded chunks: {len(all_docs['documents'])}")

categories = [meta.get("category", "Unknown") for meta in all_docs["metadatas"]]
cat_counts = Counter(categories)
print("Category Summary:")
for cat, count in cat_counts.items():
    print(f"  - {cat}: {count} chunks")


retriever = vectorstore.as_retriever()
results = retriever.get_relevant_documents("What helps with gut health?")
for i, doc in enumerate(results[:3]):
    print(f"\nResult {i+1}:")
    print("Category:", doc.metadata.get("category", "No category"))
    print("Content:", doc.page_content[:200], "...")
