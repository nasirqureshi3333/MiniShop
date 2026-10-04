from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.main import create_app


@pytest.fixture(scope="session")
def client(tmp_path_factory: pytest.TempPathFactory) -> TestClient:
    no_frontend: Path = tmp_path_factory.mktemp("empty") / "out"
    return TestClient(create_app(Settings(frontend_dir=no_frontend)))
