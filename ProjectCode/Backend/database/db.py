import os
from dotenv import load_dotenv
from supabase import create_client, Client


# --- Supabase Client Initialization ---
def init():
    """ Initializes the Supabase client using environment variables. """
    load_dotenv()
    url: str = os.getenv("VITE_SUPABASE_URL")
    key: str = os.getenv("VITE_SUPABASE_ANON_KEY")
    client: Client = create_client(url, key)

    if client is None:
        raise Exception("Error: supabase connect is not initialized")

    return client

# _______________ User functions  _______________
def get_users():
    """ Retrieves all users from the database. """
    print("\033[92m[db]\033[0m get_users")
    response = client.table("users").select("*").execute()
    return response.data

def get_user_info(id:str):
    """ Retrieves information for a specific user by ID. """
    print("\033[92m[db]\033[0m get_user_info")
    response = client.table("users").select("*").eq("id", id).execute()
    return response.data

def get_patient_caregiver_id(user_id:str):
    """ Retrieves the caregiver (admin) ID linked to a specific patient (user). """
    admin_id = client.table("admin_user_links").select("admin_id").eq("user_id", user_id).execute()    
    return admin_id.data[0]["admin_id"]

# _______________ Admin functions  _______________
def get_admin_info(id:str):
    """ Retrieves information for a specific admin by ID. """
    print("\033[92m[db]\033[0m get_admin")
    response = client.table("admins").select("*").eq("id", id).execute()
    return response.data

# _______________ User stats functions  _______________
def reset_user_stats_table():
    """ Initializes or resets the stats table for all users. """
    print("\033[92m[db]\033[0m get_user_parsed_info")
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
          "multiple_choice_current_level":1,
          "ordering_current_level":1,
          "fill_in_the_blank_current_level":1,
        }
        response = client.table("user_stats").upsert(info).execute()

    return {"status": "success"}

def reset_user_stats(id:str):
    """ Resets all exercise stats and difficulty levels for a specific user. """
    print("\033[92m[db]\033[0m reset_user_stats")
    response = client.table("user_stats").update({
        "multiple_choice_done" : 0,
        "multiple_choice_right" : 0,
        "fill_in_the_blank_done" : 0,
        "fill_in_the_blank_right" : 0,
        "ordering_done" : 0,
        "ordering_right" : 0,
        "multiple_choice_current_level":1,
        "ordering_current_level":1,
        "fill_in_the_blank_current_level":1,
    }).eq("id", id).execute()
    return response.data

def get_user_stats(id:str):
    """ Retrieves performance stats for a specific user. """
    print("\033[92m[db]\033[0m get_user_stats")
    response = client.table("user_stats").select("*").eq("id", id).execute()
    return response.data

def add_new_user_stats(id:str):
    """ Creates a new initial stats record for a specific user. """
    print("\033[92m[db]\033[0m add_new_user_stats")
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
        "multiple_choice_current_level":1,
        "ordering_current_level":1,
        "fill_in_the_blank_current_level":1,
    }
    response = client.table("user_stats").insert(info).execute()
    return response.data

def delete_user_stats(id:str):
    """ Deletes the stats record of a specific user. """
    print("\033[92m[db]\033[0m delete_user_stats")
    response = client.table("user_stats").delete().eq("id", id).execute()
    return response.data

def update_user_stats(id:str, exercise_type:str, correct:bool):
    """ Updates the exercise performance stats (done/right) for a specific user. """
    print("\033[92m[db]\033[0m update_user_stats")
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

# _______________ User Exercise stats functions  _______________
def get_user_exercises_stats(id:str, ex_types:list):
    """ Retrieves exercises stats and current difficulty level per exercise type. """
    print("\033[92m[db]\033[0m get_user_exercises_stats")
    data = get_user_stats(id)

    if not data or data == []:
        return

    data = data[0]

    response = {}

    try:
        for ex_type in ex_types:
            response[ex_type] = {
                "current_level": data[f"{ex_type}_current_level"],
                "score": {
                    "done": data[f"{ex_type}_done"],
                    "right": data[f"{ex_type}_right"]
                }
            }
        return response
    except Exception as e:
        print("Error: ", e)
        return None

def update_current_level(id:str, ex_type:str, new_level:int) -> dict:
    """ Updates the current difficulty level for a specific exercise type. """
    print("\033[92m[db]\033[0m update_current_level")
    response = (
        client.table("user_stats")
        .update({f"{ex_type}_current_level": new_level})
        .eq("id", id)
        .execute()
    ) 

    return response.data

def reset_exercise_stats(id:str, ex_type:str):
    """ Resets the stats (done/right) for a specific exercise type. """
    print("\033[92m[db]\033[0m reset_exercise_stats")
    response = (
        client.table("user_stats")
        .update({
            f"{ex_type}_done": 0,
            f"{ex_type}_right": 0
        })
        .eq("id", id)
        .execute()
    ) 

    return response.data


# Create supabase client
client = init()

if __name__ == "__main__":
    print("\033[92m[db]\033[0m Debugging")
    care_giver_id = get_patient_caregiver_id("fb389574-7091-4c84-8d9f-d9e461d7e182")
    caregiver = get_admin_info(care_giver_id)
    print(caregiver)
    

    
