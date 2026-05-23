import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# dataset simple
data = {
    "text": [
        "Win money now",
        "Meeting at 3pm",
        "Limited offer buy now",
        "Project deadline tomorrow"
    ],
    "label": [1, 0, 1, 0]  # 1 = spam, 0 = importante
}

df = pd.DataFrame(data)

# convertir texto a números
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(df["text"])

# modelo
model = LogisticRegression()
model.fit(X, df["label"])

# probar
test = ["free money now"]
test_vec = vectorizer.transform(test)
print(model.predict(test_vec))

continuar = True

def chatbot(user_input):
    user_input = user_input.lower()
    if "hola" in user_input:
        return "Hola, ¿en qué puedo ayudarte?", True
    elif "precio" in user_input:
        return "Nuestros precios empiezan en $10", True
    elif "adios" in user_input:
        return "Hasta luego!", False
    else:
        return "No entiendo tu pregunta", True

continuar = True
while continuar:
    msg = input("Tú: ")
    respuesta, continuar = chatbot(msg) # Recibimos ambos valores
    print("Bot:", respuesta)