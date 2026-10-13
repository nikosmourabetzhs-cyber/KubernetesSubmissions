# Volumes

Cluster-level storage, kept separate from the applications (normally managed by the cluster administrator).

| File | Object | Used by |
|---|---|---|
| `todo-persistentvolume.yaml` | `todo-pv` (local, 1Gi, `/tmp/kube-todo` on `k3d-k3s-default-agent-0`) | Todo app (image cache) |
| `todo-persistentvolumeclaim.yaml` | `todo-claim` | Todo app (image cache) |
| `persistentvolume.yaml` | `shared-pv` (local, 1Gi, `/tmp/kube` on `k3d-k3s-default-agent-0`) | not used since exercise 2.1 |
| `persistentvolumeclaim.yaml` | `shared-claim` | not used since exercise 2.1 |

`shared-pv` / `shared-claim` were used in exercise 1.11 to share the ping-pong count between "Log output" and "Ping-pong" through a file. Since exercise 2.1 the two applications communicate over HTTP instead.

## Setup

The directories must exist on the node before applying local PersistentVolumes:
```bash
docker exec k3d-k3s-default-agent-0 mkdir -p /tmp/kube-todo
kubectl apply -f volumes/todo-persistentvolume.yaml -f volumes/todo-persistentvolumeclaim.yaml
kubectl get pv,pvc
```
