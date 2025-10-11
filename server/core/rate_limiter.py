import os

AUTH_REQUESTS = int(os.getenv("RATE_LIMIT_AUTH_REQUESTS", 20))
AUTH_WINDOW = int(os.getenv("RATE_LIMIT_AUTH_WINDOW", 60))
