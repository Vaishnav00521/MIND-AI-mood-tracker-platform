from rest_framework import permissions

class IsPatient(permissions.BasePermission):
    """
    Allows access only to PATIENT role users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'PATIENT')

class IsTherapist(permissions.BasePermission):
    """
    Allows access only to THERAPIST role users with an active B2B flag.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'THERAPIST' and 
            request.user.is_b2b_active
        )

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to ADMIN role users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ADMIN')
