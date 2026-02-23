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

# _______________ User functions  _______________
def get_users():
    print("[db] get_users")
    response = client.table("users").select("*").execute()
    return response.data

def get_user_info(id:str):
    print("[db] get_user_info")
    response = client.table("users").select("*").eq("id", id).execute()
    return response.data

# _______________ User stats functions  _______________
def reset_user_stats_table():
    print("[db] get_user_parsed_info")
    users = get_users()

    for i, user in enumerate(users):
        info = {
          "id" : user["id"], 
          "full_name" : user["full_name"],
          "multiple_choice_done" : 0,
          "multiple_choice_right" : 0,
          "fill_in_the_blank_done" : 0,
          "fill_in_the_blank_right" : 0,
          "ordering_done" : 0,
          "ordering_right" : 0,
        }
        response = client.table("user_stats").upsert(info).execute()

    return {"status": "success"}

def get_user_stats(id:str):
    print("[db] get_user_stats")
    response = client.table("user_stats").select("*").eq("id", id).execute()
    return response.data


# Create supabase client
client = init()
