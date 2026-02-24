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

def reset_user_stats(id:str):
    print("[db] reset_user_stats")
    response = client.table("user_stats").update({
        "multiple_choice_done" : 0,
        "multiple_choice_right" : 0,
        "fill_in_the_blank_done" : 0,
        "fill_in_the_blank_right" : 0,
        "ordering_done" : 0,
        "ordering_right" : 0,
    }).eq("id", id).execute()
    return response.data

def get_user_stats(id:str):
    print("[db] get_user_stats")
    response = client.table("user_stats").select("*").eq("id", id).execute()
    return response.data

def add_new_user_stats(id:str):
    print("[db] add_new_user_stats")
    user = get_user_info(id)

    info = {
        "id" : id,
        "full_name" : user[0]["full_name"],
        "multiple_choice_done" : 0,
        "multiple_choice_right" : 0,
        "fill_in_the_blank_done" : 0,
        "fill_in_the_blank_right" : 0,
        "ordering_done" : 0,
        "ordering_right" : 0,
    }
    response = client.table("user_stats").insert(info).execute()
    return response.data

def delete_user_stats(id:str):
    print("[db] delete_user_stats")
    response = client.table("user_stats").delete().eq("id", id).execute()
    return response.data

def update_user_stats(id:str, exercise_type:str, correct:bool):
    print("[db] update_user_stats")
    user_stats = get_user_stats(id)
    if not user_stats or user_stats == []:
        return
    
    user_stats = user_stats[0]
    
    if exercise_type == "multiple_choice":
        user_stats["multiple_choice_done"] += 1
        if correct:
            user_stats["multiple_choice_right"] += 1
    elif exercise_type == "fill_in_the_blank":
        user_stats["fill_in_the_blank_done"] += 1
        if correct:
            user_stats["fill_in_the_blank_right"] += 1
    elif exercise_type == "ordering":
        user_stats["ordering_done"] += 1
        if correct:
            user_stats["ordering_right"] += 1
    
    response = client.table("user_stats").update(user_stats).eq("id", id).execute()
    return response.data


# Create supabase client
client = init()


if __name__ == "__main__":
    print("[db] Debugging")
    
    