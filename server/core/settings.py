from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import SecretStr, DirectoryPath


class Settings(BaseSettings):
    app_env: str = "dev"
    debug: bool = True
    DATA_DIR: DirectoryPath = Path(__file__).parent.parent / "scraper" / "data"

    db_enabled: bool = True
    db_driver: str = "postgresql+psycopg"
    db_host: str = "db"
    db_port: int = 5432
    db_user: str = "postgres"
    db_password: SecretStr = SecretStr("postgres")
    db_name: str = "docstral"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="DOCSTRAL_",
        case_sensitive=False,
    )

    @property
    def database_url(self) -> str:
        pwd = self.db_password.get_secret_value()
        return f"{self.db_driver}://{self.db_user}:{pwd}@{self.db_host}:{self.db_port}/{self.db_name}"


settings = Settings()
