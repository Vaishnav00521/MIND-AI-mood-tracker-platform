import os
import logging
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient
from azure.core.exceptions import ResourceNotFoundError, ClientAuthenticationError

logger = logging.getLogger(__name__)

class KeyVaultManager:
    """
    Zero-Trust Security Cloud Vault Manager.
    Connects to Azure Key Vault using Managed Identity / Environmental Default Credentials.
    """
    def __init__(self):
        self.vault_url = os.environ.get("AZURE_KEY_VAULT_URL")
        self.client = None
        self._initialize_client()

    def _initialize_client(self):
        """Initializes the SecretClient if a Vault URL is present."""
        if not self.vault_url:
            logger.warning("AZURE_KEY_VAULT_URL is not set. Falling back to local .env credentials for development.")
            return

        try:
            # DefaultAzureCredential leverages Managed Identities when running on Azure
            # or Azure CLI/Environmental variables when running locally.
            credential = DefaultAzureCredential()
            self.client = SecretClient(vault_url=self.vault_url, credential=credential)
            logger.info(f"Successfully authenticated with Azure Key Vault at {self.vault_url}")
        except Exception as e:
            logger.error(f"Failed to authenticate with Azure Key Vault: {e}")

    def get_secret(self, secret_name, default=None):
        """
        Fetches a secret from Azure Key Vault. 
        Falls back to local OS environment variables if Vault is inaccessible or running locally.
        """
        if self.client:
            try:
                # Azure Key Vault requires secret names to be dashes instead of underscores
                formatted_name = secret_name.replace("_", "-").lower()
                secret = self.client.get_secret(formatted_name)
                return secret.value
            except ResourceNotFoundError:
                logger.warning(f"Secret '{formatted_name}' not found in Key Vault. Trying local env...")
            except ClientAuthenticationError:
                 logger.error(f"Authentication error when trying to fetch '{secret_name}'.")
            except Exception as e:
                logger.error(f"Unknown Key Vault error for '{secret_name}': {e}")
        
        # Priority Fallback: Return standard environment variable (from locally loaded .env)
        return os.environ.get(secret_name, default)

# Singleton instance for settings.py to import
vault = KeyVaultManager()
