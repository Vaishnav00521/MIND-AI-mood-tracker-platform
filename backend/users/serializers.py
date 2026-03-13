from rest_framework import serializers
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'name', 'password', 'role', 'is_b2b_active', 'age', 'gender', 'occupation', 'country', 'timezone']
        extra_kwargs = {
            'password': {'write_only': True},
            'role': {'read_only': True}, # Usually role is assigned, or if open registration, we can allow it
            'is_b2b_active': {'read_only': True}
        }

    def create(self, validated_data):
        # We might allow role to be passed in registration for demo purposes, or default to PATIENT
        role = self.initial_data.get('role', 'PATIENT')
        user = CustomUser.objects.create_user(**validated_data)
        user.role = role
        user.save()
        return user
