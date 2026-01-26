import os
from functools import wraps

import requests
from flask import request, g, jsonify
from jose import jwt, jwk


JWKS_URL = os.getenv("CLERK_JWKS_URL")
ISS = os.getenv("CLERK_ISS")
AUD = os.getenv("CLERK_AUDIENCE")

_jwks_cache = None


def _get_jwks():
    global _jwks_cache
    if _jwks_cache is None:
        if not JWKS_URL:
            raise RuntimeError("CLERK_JWKS_URL is not configured")
        resp = requests.get(JWKS_URL, timeout=5)
        resp.raise_for_status()
        _jwks_cache = resp.json()
    return _jwks_cache


def _get_public_key(token: str):
    headers = jwt.get_unverified_header(token)
    kid = headers.get("kid")
    if not kid:
        raise ValueError("Token missing kid header")
    jwks = _get_jwks()
    for key in jwks.get("keys", []):
        if key.get("kid") == kid:
            # Construct a JWK-based key object compatible with python-jose
            return jwk.construct(key)
    raise ValueError("No matching JWK for token")


def require_auth(fn):
    """Decorator to require a valid Clerk JWT on the Authorization header."""

    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"success": False, "error": "Missing Bearer token"}), 401

        token = auth_header.split(" ", 1)[1]
        try:
            key = _get_public_key(token)
            # In dev, you may not configure aud/iss. If unset, skip those validations.
            decode_kwargs = {"algorithms": ["RS256"]}
            if AUD:
                decode_kwargs["audience"] = AUD
            if ISS:
                decode_kwargs["issuer"] = ISS
            # python-jose accepts the JWK dict as a key as well
            claims = jwt.decode(token, key.to_dict(), **decode_kwargs)
        except Exception as exc:  # noqa: BLE001
            return jsonify({"success": False, "error": f"Invalid token: {exc}"}), 401

        # Attach identity info to flask.g
        g.auth_sub = claims.get("sub")
        g.email = claims.get("email")
        g.name = claims.get("name")
        if not g.auth_sub:
            return jsonify({"success": False, "error": "Token missing sub"}), 401

        return fn(*args, **kwargs)

    return wrapper

