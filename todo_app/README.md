# Todo app

Simple web server. The port is set with the `PORT` environment variable (default 3000).

## Run locally
PORT=8080 node index.js

## Docker
docker build -t nikosmrb/todo_app:1.2 .
docker run --rm -e PORT=8080 nikosmrb/todo_app:1.2

## Kubernetes
kubectl create deployment todo-app-dep --image=nikosmrb/todo_app:1.2
kubectl set env deployment/todo-app-dep PORT=3001
kubectl logs deployment/todo-app-dep
