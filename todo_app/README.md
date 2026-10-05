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
    └── service.yaml      # NodePort Service (30080 -> 3000)
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
Port 8082 on the host is mapped to NodePort 30080 on the agent node:
```bash
k3d cluster create --port 8082:30080@agent:0 -p 8081:80@loadbalancer --agents 2
```

### 2. Deploy
```bash
kubectl apply -f manifests/
```

### 3. Verify
```bash
kubectl get pods,svc
kubectl logs deployment/todo-app-dep
```

### 4. Access
Through the NodePort Service:
```
http://localhost:8082
```
Traffic flow: `localhost:8082` → k3d → `agent-0:30080` (NodePort) → `todo-app-svc:1234` → pod `:3000`

Alternatively, with port-forward (no Service needed):
```bash
kubectl port-forward deployment/todo-app-dep 3003:3000
```
Open http://localhost:3003
