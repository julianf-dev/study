import requests
from ollama import chat

def get_uses_API(symbol: str) -> str:
    api_host = "https://api.coingecko.com/api/v3/simple/price"
    api_key = "your_api_key_here"  # Reemplaza con tu clave de API si es necesario

    url = f"{api_host}?ids={symbol}&vs_currencies=usd"
    headers = {"x-api-key": api_key}  # Si la API requiere autenticación   

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Verificar si la solicitud fue exitosa
        data = response.json()
        price = data.get(symbol, {}).get("usd", "Precio no disponible")
        return f"The current price of {symbol} is {price} USD."
    except requests.exceptions.RequestException as e:
        return f"Error fetching price for {symbol}: {e}"   


messages = [{"role": "user", "content": "What is the current price of Bitcoin?"}]

response = chat(
    model="llama3.2:latest",
    messages=messages,
    tools=[get_uses_API]
)

messages.append(response.message)
if(response.message.tool_calls):
    call = response.message.tool_calls[0]
    result = get_uses_API(**call.function.arguments)
    messages.append({"role": "tool", "tool_name": call.function.name, "content": str(result)})
    
    final_response = chat(
        model="llama3.2:latest",
        messages=messages,
        tools=[get_uses_API])
    print(final_response.message.content)