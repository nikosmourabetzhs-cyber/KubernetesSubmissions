# Todo app

Simple web server. The port is set with the `PORT` environment variable (default 3000).

PORT=8080 node index.js

docker build -t nikosmrb/todo_app:1.2 .
docker run --rm -e PORT=8080 nikosmrb/todo_app:1.2

kubectl apply -f manifests/deployment.yaml
kubectl logs deployment/todo-app-dep

kubectl port-forward deployment/todo-app-dep 3003:3000

The cluster must be created with the NodePort mapped:
```bash
k3d cluster create --port 8082:30080@agent:0 -p 8081:80@loadbalancer --agents 2
kubectl apply -f manifests/
```
Open http://localhost:8082
