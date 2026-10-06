# Log output

Generates a random string (UUID) on startup and keeps it in memory.

- Prints the current timestamp and the string to the logs every 5 seconds.
- Serves the current status at `GET /`.

```
2026-10-06T07:12:44.522Z: 83a96113-7bbc-49b9-b635-0fc2b3f2c35b
```

## Configuration

| Variable | Description | Default |
|---|---|---|
| `PORT` | Port the HTTP server listens on | `3000` |

## Project structure

```
log_output/
├── index.js
├── package.json
├── Dockerfile
└── manifests/
    ├── deployment.yaml   # Deployment (sets PORT=3000)
    ├── service.yaml      # ClusterIP Service (2345 -> 3000)
    └── ingress.yaml      # Ingress (/ -> log-output-svc:2345)
```

## Run locally

```bash
node index.js
curl localhost:3000
```

## Docker

```bash
docker build -t nikosmrb/log_output:1.7 .
docker run --rm -p 3000:3000 nikosmrb/log_output:1.7
```

Image: [`nikosmrb/log_output`](https://hub.docker.com/r/nikosmrb/log_output) on Docker Hub.

## Kubernetes

Create the cluster (port 8081 on the host is mapped to the Ingress on port 80):
```bash
k3d cluster create --port 8082:30080@agent:0 -p 8081:80@loadbalancer --agents 2
```

Deploy:
```bash
kubectl apply -f manifests/
kubectl get pods,svc,ing
```

Access the status through the Ingress:
```
http://localhost:8081
```
Traffic flow: `localhost:8081` → Traefik (Ingress controller) → `log-output-svc:2345` → pod `:3000`

Follow the logs:
```bash
kubectl logs -f deployment/log-output-dep
```
