# test_email.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.core.mail import send_mail

try:
    send_mail(
        'Test Subject',
        'This is a test message from Medlife AI.',
        None,
        ['your-personal-email@gmail.com'], # Put your own email here to test
        fail_silently=False,
    )
    print("SUCCESS: Email sent successfully!")
except Exception as e:
    print(f"FAILED: Error sending email -> {e}")