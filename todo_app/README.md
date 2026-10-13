# Todo app

The course project. Serves a page with:

- a random image from Lorem Picsum, cached for 10 minutes in a persistent volume (`todo-claim`)
- an input field (max 140 characters) and a "Create todo" button (not functional yet)
- a list of hardcoded todos

`GET /shutdown` stops the container, to test that the cached image survives a crash.

## Configuration

| Variable | Default |
|---|---|
| `PORT` | `3000` |
| `IMAGE_MAX_AGE_SECONDS` | `600` |

## Run

```bash
docker exec k3d-k3s-default-agent-0 mkdir -p /tmp/kube-todo
kubectl apply -f ../volumes/todo-persistentvolume.yaml -f ../volumes/todo-persistentvolumeclaim.yaml
kubectl delete -f ../log_output/manifests/ingress.yaml --ignore-not-found
kubectl apply -f manifests/
```

Open http://localhost:8081

Image: `nikosmrb/todo_app:1.13`
