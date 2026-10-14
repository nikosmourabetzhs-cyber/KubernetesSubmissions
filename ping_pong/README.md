# Ping-pong

Runs in the namespace `exercises` (create it with `kubectl create namespace exercises`).

A small HTTP server with a counter kept in memory.

| Endpoint | Description |
|---|---|
| `GET /pingpong` | Responds with `pong <counter>` and increments the counter |
| `GET /pings` | Returns the current count as JSON (`{"pings": 3}`) without incrementing it |

`/pingpong` is exposed to the browser through the Ingress of the "Log output" application.
`/pings` is an internal endpoint: the "Log output" application calls it over HTTP through `ping-pong-svc:2345`.

The counter is kept in memory, so it resets when the pod restarts.

## Configuration

| Variable | Description | Default |
|---|---|---|
| `PORT` | Port the server listens on | `3000` |

## Project structure

ping_pong/
├── index.js
├── package.json
├── Dockerfile
└── manifests/
├── deployment.yaml # Deployment (sets PORT=3000)
└── service.yaml # ClusterIP Service (2345 -> 3000)


The Ingress is shared with the "Log output" application: see `../log_output/manifests/ingress.yaml`.

## Run locally

```bash
node index.js
curl localhost:3000/pingpong
curl localhost:3000/pings
```

## Docker

```bash
docker build -t nikosmrb/ping_pong:2.7 .
docker run --rm -p 3000:3000 nikosmrb/ping_pong:2.7
```

Image: [`nikosmrb/ping_pong`](https://hub.docker.com/r/nikosmrb/ping_pong) on Docker Hub.

## Kubernetes

Deploy together with "Log output" (they share the same Ingress):
```bash
kubectl apply -f manifests/
kubectl apply -f ../log_output/manifests/
```

Access from the browser:

http://localhost:8081/pingpong


Check the internal endpoint from inside the cluster:
```bash
kubectl run tester --rm -it --restart=Never --image=curlimages/curl -- \
  curl -s http://ping-pong-svc:2345/pings
```

## Database

The counter is stored in PostgreSQL (`manifests/postgres.yaml`): a StatefulSet with one replica, a headless Service `postgres-svc`, and a volume from `volumeClaimTemplates` (`local-path`), so the counter survives pod restarts.

The password is a Secret that is not stored in git. Create it before applying:
```bash
kubectl create secret generic postgres-secret -n exercises \
  --from-literal=POSTGRES_PASSWORD=<password>
kubectl apply -f manifests/
```

The app connects with the standard env variables `PGHOST`, `PGUSER`, `PGDATABASE` and `PGPASSWORD`.
