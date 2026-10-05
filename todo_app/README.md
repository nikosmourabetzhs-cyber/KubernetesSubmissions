# Todo app

Simple web server. The port is set with the `PORT` environment variable (default 3000).

## Run locally
PORT=8080 node index.js

## Docker
docker build -t nikosmrb/todo_app:1.2 .
docker run --rm -e PORT=8080 nikosmrb/todo_app:1.2

## Kubernetes
kubectl apply -f manifests/deployment.yaml
kubectl logs deployment/todo-app-dep

## Access (port-forward)
kubectl port-forward deployment/todo-app-dep 3003:3000
