import os

from django.http import JsonResponse


def _healthcheck_paths() -> set[str]:
    configured = os.getenv("DJANGO_HEALTHCHECK_PATHS", "/api/health/")
    return {path.strip() for path in configured.split(",") if path.strip()}


class HealthcheckBypassMiddleware:
    """
    Returns a simple 200 response for healthcheck endpoints before host validation,
    SSL redirect, or any other middleware can interfere with platform probes.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path in _healthcheck_paths():
            return JsonResponse({"status": "ok"})

        return self.get_response(request)
