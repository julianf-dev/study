import json
import os

MEMORY_FILE = "memory.json"

def save_memory(state):
    data = state.__dict__
    with open(MEMORY_FILE, "w") as f:
        json.dump(data, f, indent=2)

def load_memory():
    if not os.path.exists(MEMORY_FILE):
        return None
    with open(MEMORY_FILE, "r") as f:
        return json.load(f)