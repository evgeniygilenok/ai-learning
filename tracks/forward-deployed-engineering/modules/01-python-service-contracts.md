# 01. Python checklist for experienced engineers

Optional reference. Allow up to 4 hours if these ecosystem details are unfamiliar, or look them up while building. There is no introductory programming course, separate lab, or language gate.

## Python topics to check

- Environment and packages: virtual environments, pyproject.toml, dependency locking, imports, and project layout.
- Type hints: unions, generics, protocols, optional values, and the static checker used by the project.
- Data objects: dataclasses, Pydantic models, explicit validation, strictness, and serialization. [Pydantic models](https://pydantic.dev/docs/validation/latest/concepts/models/)
- Language differences worth checking: mutability, object identity, default arguments, comprehensions, iterators, and generators.
- Resource cleanup: exceptions, context managers, finally blocks, and transaction lifetimes.
- Async execution: coroutines, tasks, TaskGroup, cancellation, deadlines, semaphores, and blocking dependencies. [Asyncio tasks](https://docs.python.org/3/library/asyncio-task.html)
- Service conventions: FastAPI request/response models, dependency injection, error handling, and sync/async handlers. [FastAPI concurrency](https://fastapi.tiangolo.com/async/)
- Persistence: the selected PostgreSQL driver's transactions, connection pool, parameter binding, and migration tooling.
- Data handling: timezone-aware timestamps, decimal values where precision matters, JSON encoding, and structured errors.
- Testing and operations: pytest fixtures and parametrization, fakes, dependency replacement, logging, configuration, and graceful shutdown. [Pytest dependency replacement](https://docs.pytest.org/en/stable/how-to/monkeypatch.html)

Use the service and integration labs elsewhere in the course to pick up the relevant Python details. Reuse the systems concepts you already know. Ask the tutor about a specific semantic or library behavior when it affects implementation.
