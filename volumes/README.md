# Volumes

Cluster-level storage, kept separate from the applications (normally managed by the cluster administrator).

| File | Object | Used by |
|---|---|---|
| `persistentvolume.yaml` | `shared-pv` (local, 1Gi, `/tmp/kube` on `k3d-k3s-default-agent-0`) | not used since exercise 2.1 |
| `persistentvolumeclaim.yaml` | `shared-claim` | not used since exercise 2.1 |

`shared-pv` / `shared-claim` were used in exercise 1.11 to share the ping-pong count between "Log output" and "Ping-pong" through a file. Since exercise 2.1 the two applications communicate over HTTP instead, so these objects are not applied.

## Setup (if needed)

The directory must exist on the node before applying a local PersistentVolume:
```bash
docker exec k3d-k3s-default-agent-0 mkdir -p /tmp/kube
kubectl apply -f volumes/
kubectl get pv,pvc
```
