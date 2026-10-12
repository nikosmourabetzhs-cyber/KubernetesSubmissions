# Volumes

Cluster-level storage, kept separate from the applications (normally managed by the cluster administrator).

- `persistentvolume.yaml`: a local PersistentVolume (`shared-pv`, 1Gi) at `/tmp/kube` on node `k3d-k3s-default-agent-0`
- `persistentvolumeclaim.yaml`: the claim `shared-claim`, used by both "Log output" and "Ping-pong"

## Setup

The directory must exist on the node before applying:
```bash
docker exec k3d-k3s-default-agent-0 mkdir -p /tmp/kube
kubectl apply -f volumes/
kubectl get pv,pvc
```

Files stored in the volume:
| File | Written by | Read by |
|---|---|---|
| `log.txt` | log output writer | log output reader |
| `pingpong.txt` | ping-pong | log output reader |
