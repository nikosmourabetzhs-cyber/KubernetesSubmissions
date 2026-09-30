# Log output

Generates a random string (UUID) on startup and prints it every 5 seconds with a timestamp.

## Run locally
```bash
node index.js
```

## Docker
```bash
docker build -t <dockerhub-user>/log-output:1.1 .
docker run --rm <dockerhub-user>/log-output:1.1
```

## Kubernetes
```bash
kubectl create deployment log-output-dep --image=<dockerhub-user>/log-output:1.1
kubectl logs -f deployment/log-output-dep
```
