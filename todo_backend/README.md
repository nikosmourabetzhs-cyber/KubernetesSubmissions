# Todo backend

Stores the todos of the project in memory.

| Endpoint | Description |
|---|---|
| `GET /todos` | List of todos (JSON) |
| `POST /todos` | Adds a todo from the form field `todo` (max 140 characters), then redirects to `/` |

Reached by the todo-app through `todo-backend-svc:2345`, and by the browser form through the Ingress path `/todos`.

## Run

```bash
kubectl apply -f manifests/
```

Image: `nikosmrb/todo_backend:2.2`
