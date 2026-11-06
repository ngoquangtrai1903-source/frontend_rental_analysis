"""Validate Google sign-in before allowing direct FastAPI prediction requests."""

import json
import os
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

bearer = HTTPBearer(auto_error=False)
LOGIN_MESSAGE = "Vui lòng đăng nhập để sử dụng tính năng dự đoán giá"


def require_google_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> dict:
    if credentials is None:
        raise HTTPException(401, LOGIN_MESSAGE, headers={"WWW-Authenticate": "Bearer"})

    supabase_url = os.getenv(
        "NEXT_PUBLIC_SUPABASE_URL", "https://vfvulyiabgfwujmjunva.supabase.co"
    ).rstrip("/")
    supabase_key = os.getenv(
        "NEXT_PUBLIC_SUPABASE_ANON_KEY", "sb_publishable_b5FYMZo4Z0bKHQT4ZCkDKA_E65rMNfN"
    )
    request = Request(
        f"{supabase_url}/auth/v1/user",
        headers={
            "apikey": supabase_key,
            "Authorization": f"Bearer {credentials.credentials}",
        },
    )
    try:
        with urlopen(request, timeout=10) as response:
            user = json.load(response)
    except HTTPError as exc:
        if exc.code in (400, 401, 403):
            raise HTTPException(401, LOGIN_MESSAGE) from exc
        raise HTTPException(503, "Không thể kiểm tra đăng nhập. Vui lòng thử lại.") from exc
    except (URLError, TimeoutError, OSError, ValueError) as exc:
        raise HTTPException(503, "Không thể kiểm tra đăng nhập. Vui lòng thử lại.") from exc

    if not isinstance(user, dict) or not user.get("id"):
        raise HTTPException(401, LOGIN_MESSAGE)
    metadata = user.get("app_metadata") or {}
    if user.get("is_anonymous") or metadata.get("provider") != "google":
        raise HTTPException(403, LOGIN_MESSAGE)
    return user
