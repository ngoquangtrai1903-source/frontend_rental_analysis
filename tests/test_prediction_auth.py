import io
import json
import unittest
from unittest.mock import patch
from urllib.error import HTTPError, URLError

from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

from prediction_auth import require_google_user


class PredictionAuthTests(unittest.TestCase):
    def setUp(self):
        app = FastAPI()
        self.model_calls = 0

        @app.post("/predict", dependencies=[Depends(require_google_user)])
        def predict():
            self.model_calls += 1
            return {"success": True}

        self.client = TestClient(app)

    @patch("prediction_auth.urlopen")
    def test_guest_cannot_call_model(self, urlopen):
        self.assertEqual(self.client.post("/predict").status_code, 401)
        self.assertEqual(self.model_calls, 0)
        urlopen.assert_not_called()

    @patch("prediction_auth.urlopen")
    def test_google_session_can_call_model(self, urlopen):
        urlopen.return_value = io.BytesIO(json.dumps({
            "id": "google-user", "app_metadata": {"provider": "google"}
        }).encode())
        response = self.client.post("/predict", headers={"Authorization": "Bearer valid-token"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.model_calls, 1)
        request = urlopen.call_args.args[0]
        self.assertEqual(request.get_header("Authorization"), "Bearer valid-token")
        self.assertTrue(request.full_url.endswith("/auth/v1/user"))

    @patch("prediction_auth.urlopen")
    def test_expired_or_revoked_token_is_rejected(self, urlopen):
        urlopen.side_effect = HTTPError("https://auth.example/user", 401, "Unauthorized", {}, None)
        self.assertEqual(self.client.post("/predict", headers={"Authorization": "Bearer expired"}).status_code, 401)
        self.assertEqual(self.model_calls, 0)

    @patch("prediction_auth.urlopen")
    def test_editable_google_metadata_does_not_grant_access(self, urlopen):
        urlopen.return_value = io.BytesIO(json.dumps({
            "id": "email-user", "app_metadata": {"provider": "email"},
            "user_metadata": {"provider": "google"}
        }).encode())
        self.assertEqual(self.client.post("/predict", headers={"Authorization": "Bearer token"}).status_code, 403)
        self.assertEqual(self.model_calls, 0)

    @patch("prediction_auth.urlopen")
    def test_auth_outage_fails_closed(self, urlopen):
        urlopen.side_effect = URLError("offline")
        self.assertEqual(self.client.post("/predict", headers={"Authorization": "Bearer token"}).status_code, 503)
        self.assertEqual(self.model_calls, 0)


if __name__ == "__main__":
    unittest.main()
