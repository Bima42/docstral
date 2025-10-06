import os

AUTH_REQUESTS = int(os.getenv("RATE_LIMIT_AUTH_REQUESTS", 5))
AUTH_WINDOW = int(os.getenv("RATE_LIMIT_AUTH_WINDOW", 60))
