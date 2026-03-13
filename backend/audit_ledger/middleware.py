import json
from django.utils.deprecation import MiddlewareMixin
from .models import AuditBlock

class AuditMiddleware(MiddlewareMixin):
    """
    Automatically tracks Enterprise-level read/write operations against the API
    and records an immutable footprint in the Database Ledger.
    """
    def process_response(self, request, response):
        if hasattr(request, 'user') and request.user.is_authenticated:
            # We specifically want to audit B2B Therapist Access and high-level endpoints
            path = request.path
            
            # Simple heuristic for this feature: any hit to /api/analytics/ by a therapist
            # Or perhaps viewing a specific patient (e.g. /api/patients/<id>/) etc.
            if request.user.role == 'THERAPIST' and path.startswith('/api/'):
                def extract_ip(req):
                    x_forwarded_for = req.META.get('HTTP_X_FORWARDED_FOR')
                    if x_forwarded_for:
                        return x_forwarded_for.split(',')[0]
                    return req.META.get('REMOTE_ADDR')

                # Using thread-based async execution or a Celery task is better in prod,
                # but we'll write directly for demonstration purposes.
                action_str = f"{request.method} {path}"
                
                # Check if it was a data extraction fetch (e.g. exporting to CSV)
                if 'export' in path:
                    action_str = "EXPORT_PATIENT_ARCHIVE"
                elif 'dashboard' in path:
                    action_str = "VIEW_THERAPIST_DASHBOARD"
                    
                try:
                    AuditBlock.objects.create(
                        actor=request.user,
                        action=action_str,
                        ip_address=extract_ip(request)
                    )
                except Exception as e:
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Failed to write to immutable ledger: {e}")
                
        return response
