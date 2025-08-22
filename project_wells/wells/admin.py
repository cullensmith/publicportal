from django.contrib import admin

from .models import CSVRequestLog

@admin.register(CSVRequestLog)
class CSVRequestLogAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'ip_address', 'requested_at')
    search_fields = ('name', 'email', 'ip_address')
