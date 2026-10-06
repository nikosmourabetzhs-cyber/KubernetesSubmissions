# Todo app

The course project. A Node.js web server that will grow into a todo application.

Currently it serves a simple HTML page at `GET /`.

## Configuration

| Variable | Description | Default |
|---|---|---|
| `PORT` | Port the server listens on | `3000` |

On startup the server logs `Server started in port <PORT>`.

## Project structure

```
todo_app/
├── index.js              # web server
├── package.json
├── Dockerfile
└── manifests/
    ├── deployment.yaml   # Deployment (sets PORT=3000)
    ├── service.yaml      # ClusterIP Service (2345 -> 3000)
    └── ingress.yaml      # Ingress (/ -> todo-app-svc:2345)
```

## Run locally

```bash
PORT=3000 node index.js
```
Open http://localhost:3000

## Docker

```bash
docker build -t nikosmrb/todo_app:1.5 .
docker run --rm -e PORT=3000 -p 3000:3000 nikosmrb/todo_app:1.5
```

Image: [`nikosmrb/todo_app`](https://hub.docker.com/r/nikosmrb/todo_app) on Docker Hub.

## Kubernetes

### 1. Create the cluster
Port 8081 on the host is mapped to the Ingress on port 80:
```bash
k3d cluster create --port 8082:30080@agent:0 -p 8081:80@loadbalancer --agents 2
```

### 2. Deploy
The Ingress uses the path `/`, so the "Log output" Ingress must not be applied at the same time:
```bash
kubectl delete -f ../log_output/manifests/ingress.yaml --ignore-not-found
kubectl apply -f manifests/
```

### 3. Verify
```bash
kubectl get pods,svc,ing
kubectl logs deployment/todo-app-dep
```

### 4. Access
Through the Ingress:
```
http://localhost:8081
```
Traffic flow: `localhost:8081` → Traefik (Ingress controller) → `todo-app-svc:2345` → pod `:3000`
