from ollama import chat

def get_temperature(city: str) -> str:
    """ Obtener la temperatura actual de una ciudad.
    Args:
        city (str): El nombre de la ciudad.
        
    Returns:
        str: La temperatura actual en la ciudad especificada.
    """
    temperatures = {
        "New York": "15°C",
        "Los Angeles": "20°C",
        "Chicago": "10°C",
        "Houston": "25°C",
        "Phoenix": "30°C"
    }
    return temperatures.get(city, "Ciudad no encontrada")


messages = [{"role": "user", "content": "What is the current temperature in Phoenix?"}]

response = chat(
    model="llama3.2:latest",
    messages=messages,
    tools=[get_temperature]
)

messages.append(response.message)
if(response.message.tool_calls):
    call = response.message.tool_calls[0]
    result = get_temperature(**call.function.arguments)
    messages.append({"role": "tool", "tool_name": call.function.name, "content": str(result)})
    
    final_response = chat(
        model="llama3.2:latest",
        messages=messages,
        tools=[get_temperature])
    print(final_response.message.content)