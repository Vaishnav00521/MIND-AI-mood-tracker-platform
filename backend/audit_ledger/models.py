import uuid
import hashlib
from django.db import models
from django.conf import settings
from django.utils import timezone

class AuditBlock(models.Model):
    """
    Immutable Cryptographic Ledger for B2B Enterprise Compliance.
    Stores every access event securely linked by SHA-256 hashes.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    timestamp = models.DateTimeField(default=timezone.now)
    
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='audit_actions_performed')
    target_patient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_records_accessed')
    
    action = models.CharField(max_length=255) # e.g. "VIEW_THERAPIST_DASHBOARD", "EXPORT_PATIENT_ARCHIVE"
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    previous_hash = models.CharField(max_length=64, default="GENESIS_BLOCK")
    block_hash = models.CharField(max_length=64, blank=True)

    class Meta:
        ordering = ['-timestamp']

    def calculate_hash(self):
        """
        Creates a sha256 hash using the previous hash and the current block's payload.
        """
        actor_id = str(self.actor.id) if self.actor else "SYSTEM"
        target_id = str(self.target_patient.id) if self.target_patient else "NONE"
        
        payload = f"{actor_id}:{target_id}:{self.action}:{self.timestamp.isoformat()}:{self.previous_hash}"
        return hashlib.sha256(payload.encode('utf-8')).hexdigest()

    def save(self, *args, **kwargs):
        if not self.block_hash:
            # Find previous block
            last_block = AuditBlock.objects.order_by('-timestamp', '-id').first()
            if last_block:
                self.previous_hash = last_block.block_hash
                
            self.block_hash = self.calculate_hash()
            
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Block {self.block_hash[:8]} - {self.action}"
