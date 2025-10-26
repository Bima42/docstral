from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import SecretStr, DirectoryPath


class Settings(BaseSettings):
    APP_ENV: str = "dev"
    DEBUG: bool = True
    DATA_DIR: DirectoryPath = Path(__file__).parent.parent / "scraper" / "data"

    DB_ENABLED: bool = True
    DB_DRIVER: str = "postgresql+psycopg"
    DB_HOST: str = "db"
    DB_PORT: int = 5432
    DB_USER: str = "postgres"
    DB_NAME: str = "docstral"
    SENTENCE_TRANSFORMER_MODEL: str = "BAAI/bge-small-en-v1.5"
    SELF_HOSTED_LLM_URL: str | None = None
    SELF_HOSTED_API_KEY: str | None = None

    MISTRAL_API_KEY: str
    DB_PASSWORD: SecretStr
    ADMIN_TOKEN: SecretStr

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="DOCSTRAL_",
        case_sensitive=False,
    )

    @property
    def database_url(self) -> str:
        pwd = self.DB_PASSWORD.get_secret_value()
        return f"{self.DB_DRIVER}://{self.DB_USER}:{pwd}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"


settings = Settings()
