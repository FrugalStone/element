import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import sys

n = len(sys.argv)

def send_email(sender_email, sender_password, recipient_email, subject, message):
    # Set up the SMTP server
    smtp_server = 'smtp.office365.com'
    smtp_port = 587

    # Create the email message
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = recipient_email
    msg['Subject'] = subject
    msg.attach(MIMEText(message, 'plain'))

    try:
        # Connect to the SMTP server
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()

        # Login to your Outlook account
        server.login(sender_email, sender_password)

        # Send the email
        server.send_message(msg)
        print('Email sent successfully!')

    except Exception as e:
        print('An error occurred while sending the email:', str(e))

    finally:
        # Close the connection to the SMTP server
        server.quit()

# Get user input
sender_email = "elementreset@outlook.com"
sender_password = "Vinayak is the goat"
recipient_email = sys.argv[1]
subject = sys.argv[2]
message = sys.argv[3]

# Send the email
send_email(sender_email, sender_password, recipient_email, subject, message)