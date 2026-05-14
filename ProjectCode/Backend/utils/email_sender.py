import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Datos del correo

def send_email(email_receptor:str, titulo:str, contenido:str, email_type:str="plain"):
    print(f"\033[97m[email_sender]\033[0m Sending email to {email_receptor} with title {titulo}")
    email_emisor = "vertexlitupv@gmail.com" 
    password = "wbjk pnnl fkdt ydjk"

    # Crear mensaje
    mensaje = MIMEMultipart()
    mensaje["From"] = email_emisor
    mensaje["To"] = email_receptor
    mensaje["Subject"] = titulo

    # Contenido del email
    cuerpo = contenido

    mensaje.attach(MIMEText(cuerpo, email_type))

    # Enviar correo
    try:
        servidor = smtplib.SMTP("smtp.gmail.com", 587)
        servidor.starttls()

        servidor.login(email_emisor, password)

        servidor.sendmail(
            email_emisor,
            email_receptor,
            mensaje.as_string()
        )

        servidor.quit()

        print("Correo enviado correctamente")

    except Exception as e:
        print("Error al enviar correo:", e)

def send_alert_email(email_receptor:str, name:str, user_id:str, ex_type:str):
    html = f"""<html> <body style="font-family: Arial, sans-serif; background-color:#f4f4f4; padding:20px;"> <div style=" max-width:600px; margin:auto; background:white; padding:30px; border-radius:10px; box-shadow:0 2px 10px rgba(0,0,0,0.1); "> <h2 style="color:#d9534f;"> Alerta de seguimiento </h2> <p> Hola, </p> <p> Se ha detectado que el paciente <strong>{name}</strong> ({user_id}) ha tenido dificultades repetidas en el ejercicio: <strong>{ex_type}</strong>. </p> <p> Por este motivo, el ejercicio ha sido desactivado temporalmente para evitar frustración y adaptar mejor el seguimiento. </p> <div style=" background:#fff3cd; padding:15px; border-radius:8px; margin-top:20px; "> Se recomienda revisar la evolución del paciente. </div> <p style="margin-top:30px;"> Saludos,<br> Sistema de seguimiento cognitivo </p> </div> </body> </html> """

    send_email(email_receptor, "Alerta de seguimiento", html, "html")


