# core/user/managment/commands/delete_unverified_users.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from core.user.models import User

class Command(BaseCommand):
    help = 'Удаляет пользователей, не подтвердивших email за сутки'

    def handle(self, *args, **options):
        threshold = timezone.now() - timezone.timedelta(hours=24)
        qs = User.objects.filter(is_email_verified=False, email_verification_sent__lt=threshold)
        count = qs.count()
        qs.delete()
        self.stdout.write(self.style.SUCCESS(f'Удалено {count} неподтверждённых пользователей'))
