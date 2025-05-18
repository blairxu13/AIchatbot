from langchain_community.document_loaders import PlaywrightURLLoader
from playwright.sync_api import sync_playwright 
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.llms import Ollama
from langchain.chains import RetrievalQA

categories = {
    "Fitness": ["https://cymbiotika.com/collections/fitness-supplements"],
    "Energy": ["https://cymbiotika.com/collections/energy-supplements"],
    "Immunity": ["https://cymbiotika.com/collections/immunity-supplements"],
    "Skin Health": ["https://cymbiotika.com/collections/skin-health-supplements"],
    "Detox": ["https://cymbiotika.com/collections/detox-supplements"],
    "Brain Health": ["https://cymbiotika.com/collections/brain-health-supplements"],
    "Gut Health": ["https://cymbiotika.com/collections/gut-health-supplements"],
    "Healthy-Aging": ["https://cymbiotika.com/collections/healthy-aging-supplements"],
    "Stress Relief": ["https://cymbiotika.com/collections/stress-relief-supplements"],
    "Recovery": ["https://cymbiotika.com/collections/recovery-supplements"],
    "Heart Health": ["https://cymbiotika.com/collections/heart-health-supplements"],
    "Joint and Bone": ["https://cymbiotika.com/collections/joint-and-bone-supplements"]
}

all_docs = []

def get_all_product_links(category_url):
    """Scrapes all product links from a collection page (like 'Fitness')."""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(category_url)

        product_links = page.evaluate('''
            () => {
                return Array.from(document.querySelectorAll("a"))
                    .map(link => link.getAttribute("href"))
                    .filter(href => href && href.includes("/products/"));
            }
        ''')

        browser.close()

        full_links = list(set(
            "https://cymbiotika.com" + link if link.startswith("/") else link
            for link in product_links
        ))

        return full_links

for categoryName, urls in categories.items():
    for url in urls:
        # print(f"🔎 Scraping category: {categoryName}")
        product_links = get_all_product_links(url)
        loader = PlaywrightURLLoader(urls=product_links)
        docs = loader.load()
        
        for doc in docs:
            doc.metadata["category"] = categoryName
            all_docs.append(doc)

splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=10)
chunks = splitter.split_documents(all_docs)

embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

vectorstore = Chroma.from_documents(
    documents=chunks,                         
    embedding=embeddings,                    
    persist_directory="./chroma_db"
)


print(f"💾 About to save {len(chunks)} chunks to Chroma...")

vectorstore.persist()




