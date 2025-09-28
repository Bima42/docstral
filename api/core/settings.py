from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "dev"
    debug: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="DOCSTRAL_",
        case_sensitive=False,
    )


settings = Settings()
