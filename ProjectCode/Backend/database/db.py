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

def get_patient_caretaker_id(user_id:str):
    """ Retrieves the caregiver (admin) ID linked to a specific patient (user). """
    admin_id = client.table("user_admin_links").select("admin_id").eq("user_id", user_id).execute()    
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
    if not response.data:
        return add_new_user_stats(id)
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

def get_exercise_limits(user_id: str):
    """ Retrieves the exercise limits for a specific user. """
    print("\033[92m[db]\033[0m get_exercise_limits")
    try:
        response = client.table("users").select("multiple_choice, fill_in_the_blank, ordering").eq("id", user_id).execute()
        if response.data and len(response.data) > 0:
            limits = response.data[0]
            return {
                "multiple_choice": limits.get("multiple_choice") if limits.get("multiple_choice") is not None else 1,
                "fill_in_the_blank": limits.get("fill_in_the_blank") if limits.get("fill_in_the_blank") is not None else 1,
                "ordering": limits.get("ordering") if limits.get("ordering") is not None else 1,
            }
    except Exception as e:
        print(f"\033[91m[db]\033[0m Error fetching exercise limits: {e}")
    
    return {
        "multiple_choice": 1,
        "fill_in_the_blank": 1,
        "ordering": 1,
    }

def delete_account(id):
    # See if its a user:
    user_data = client.table("users").select("id").eq("auth_id", id).execute()

    if user_data is not None or user_data.data != []:
        delete_user_account(id)
        return ""

    admin_data = client.table("admins").select("id").eq("auth_id", id).execute()

    if admin_data is not None or admin_data.data != []:
        delete_admin_account(id)
        return ""

    print("\033[91m[db]\033[0m Account not found")
    return ""

def delete_user_account(auth_id: str):
    """
    Deletes a user account and all associated data.
    Removes data from: user_stats, user_admin_links, memories, users tables.
    Then deletes the auth user using admin API.
    """
    print(f"\033[92m[db]\033[0m delete_user_account: {auth_id}")

    # Get id by auth_id
    user_data = client.table("users").select("id").eq("auth_id", auth_id).execute()

    if user_data is None or user_data.data == []:
        return {"error": "User not found"}

    user_id = user_data.data[0]["id"]

    if user_id is None:
        return {"error": "User not found"}

    # Delete user record
    try:
        client.table("users").delete().eq("id", user_id).execute()
        print(f"\033[92m[db]\033[0m Deleted user record for {user_id}")
    except Exception as e:
        print(f"\033[91m[db]\033[0m Error deleting user record: {e}")

    # Delete auth user (requires service_role key)
    try:
        client.auth.admin.delete_user(auth_id)
        print(f"\033[92m[db]\033[0m Deleted auth user {auth_id}")
    except Exception as e:
        print(f"\033[91m[db]\033[0m Error deleting auth user: {e}")

    return {"status": "success"}

def delete_admin_account(auth_id: str):
    """
    Deletes a user account and all associated data.
    Removes data from: user_stats, user_admin_links, memories, users tables.
    Then deletes the auth user using admin API.
    """
    print(f"\033[92m[db]\033[0m delete_admin_account: {auth_id}")

    # Get id by auth_id
    admin_data = client.table("admins").select("id").eq("auth_id", auth_id).execute()

    if admin_data is None or admin_data.data == []:
        return {"error": "Admin not found"}

    admin_id = admin_data.data[0]["id"]

    if admin_id is None:
        return {"error": "Admin not found"}

    # Delete user-admin links
    try:
        client.table("user_admin_links").delete().eq("admin_id", admin_id).execute()
        print(f"\033[92m[db]\033[0m Deleted user_admin_links for {admin_id}")
    except Exception as e:
        print(f"\033[91m[db]\033[0m Error deleting user_admin_links: {e}")


    # Delete admin record
    try:
        client.table("admins").delete().eq("id", admin_id).execute()
        print(f"\033[92m[db]\033[0m Deleted admin record for {admin_id}")
    except Exception as e:
        print(f"\033[91m[db]\033[0m Error deleting admin record: {e}")

    # Delete auth user (requires service_role key)
    try:
        client.auth.admin.delete_user(auth_id)
        print(f"\033[92m[db]\033[0m Deleted auth admin {auth_id}")
    except Exception as e:
        print(f"\033[91m[db]\033[0m Error deleting auth admin: {e}")

    return {"status": "success"}




# Create supabase client
client = init()

if __name__ == "__main__":
    print("\033[92m[db]\033[0m Debugging")
    delete_admin_account("8a95f2ff-deb9-4c04-8faf-07ab169e52a1")

    

    
