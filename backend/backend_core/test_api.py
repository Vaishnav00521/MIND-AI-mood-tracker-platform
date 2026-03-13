import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from users.models import CustomUser

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def create_user(db):
    user = CustomUser.objects.create_user(
        email='testuser@example.com',
        password='testpassword123',
        name='Test User'
    )
    return user

@pytest.mark.django_db
def test_register_user(api_client):
    url = reverse('register')
    data = {
        'email': 'newuser@example.com',
        'password': 'newpassword123',
        'name': 'New User',
        'age': 25,
        'gender': 'Male'
    }
    response = api_client.post(url, data, format='json')
    assert response.status_code == status.HTTP_201_CREATED
    assert CustomUser.objects.filter(email='newuser@example.com').exists()

@pytest.mark.django_db
def test_login_user(api_client, create_user):
    url = reverse('login')
    data = {
        'email': 'testuser@example.com',
        'password': 'testpassword123'
    }
    response = api_client.post(url, data, format='json')
    assert response.status_code == status.HTTP_200_OK
    assert 'access' in response.data
    assert 'refresh' in response.data

@pytest.mark.django_db
def test_get_profile(api_client, create_user):
    # First login to get token
    login_url = reverse('login')
    login_data = {'email': 'testuser@example.com', 'password': 'testpassword123'}
    login_response = api_client.post(login_url, login_data, format='json')
    token = login_response.data['access']

    # Now get profile
    profile_url = reverse('profile')
    api_client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
    response = api_client.get(profile_url)
    
    assert response.status_code == status.HTTP_200_OK
    assert response.data['email'] == 'testuser@example.com'
