# Log output

Generates a random string (UUID) on startup, keeps it in memory and prints it every 5 seconds with a timestamp:

```
2026-09-30T07:12:44.522Z: 83a96113-7bbc-49b9-b635-0fc2b3f2c35b
2026-09-30T07:12:49.534Z: 83a96113-7bbc-49b9-b635-0fc2b3f2c35b
```

## Project structure

```
log_output/
├── index.js
├── package.json
├── Dockerfile
└── manifests/
    └── deployment.yaml
```

## Run locally

```bash
node index.js
```

## Docker

```bash
docker build -t nikosmrb/log_output:1.1 .
docker run --rm nikosmrb/log_output:1.1
```

Image: [`nikosmrb/log_output`](https://hub.docker.com/r/nikosmrb/log_output) on Docker Hub.

## Kubernetes

```bash
kubectl apply -f manifests/
kubectl logs -f deployment/log-output-dep
```
