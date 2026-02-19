import os
from dotenv import load_dotenv
from supabase import create_client, Client


# --- Supabase Client Initialization ---
def init():
    load_dotenv()
    url: str = os.getenv("VITE_SUPABASE_URL")
    key: str = os.getenv("VITE_SUPABASE_ANON_KEY")
    client: Client = create_client(url, key)

    if client is None:
        raise Exception("Error: supabase connect is not initialized")

    return client
    


# --- Database Functions ---
def get_users():
    response = client.table("users").select("*").execute()
    return response.data

def get_user_data(id:str):
    response = client.table("users").select("*").eq("id", id).execute()
    return response.data



# Create supabase client
client = init()
print(get_users())