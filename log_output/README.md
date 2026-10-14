# Log output

Runs in the namespace `exercises` (create it with `kubectl create namespace exercises`).

Two containers in a single pod, sharing an `emptyDir` volume mounted at `/usr/src/app/files`:

- **writer**: generates a random string (UUID) on startup and appends a line with the timestamp and the string to `files/log.txt` every 5 seconds.
- **reader**: serves `GET /` with the last line of `files/log.txt` and the number of ping-pongs. The number is requested over HTTP from the ping-pong application (`GET http://ping-pong-svc:2345/pings`).

Example response:

2026-10-13T05:53:25.538Z: bb78e8ec-97ed-4b1f-903f-dc56de226653.
Ping / Pongs: 3


## Configuration (reader)

| Variable | Description | Default |
|---|---|---|
| `PORT` | Port the HTTP server listens on | `3000` |
| `PING_PONG_URL` | Endpoint of the ping-pong application that returns the count | `http://ping-pong-svc:2345/pings` |

## Project structure

log_output/
├── writer/ # writes the log file
│ ├── index.js
│ ├── package.json
│ └── Dockerfile
├── reader/ # serves the log line + ping-pong count over HTTP
│ ├── index.js
│ ├── package.json
│ └── Dockerfile
└── manifests/
├── deployment.yaml # 1 pod, 2 containers, shared emptyDir
├── service.yaml # ClusterIP Service (2345 -> 3000, the reader)
└── ingress.yaml # Ingress: / -> log-output-svc, /pingpong -> ping-pong-svc


## Docker

```bash
docker build -t nikosmrb/log_output_writer:1.10 writer/
docker build -t nikosmrb/log_output_reader:2.5.2 reader/
```

Images on Docker Hub:
- [`nikosmrb/log_output_writer`](https://hub.docker.com/r/nikosmrb/log_output_writer)
- [`nikosmrb/log_output_reader`](https://hub.docker.com/r/nikosmrb/log_output_reader)

## Kubernetes

Create the cluster (port 8081 on the host is mapped to the Ingress on port 80):
```bash
k3d cluster create --port 8082:30080@agent:0 -p 8081:80@loadbalancer --agents 2
```

Deploy together with the ping-pong application:
```bash
kubectl apply -f ../ping_pong/manifests/
kubectl apply -f manifests/
kubectl get pods -n exercises   # log-output READY 2/2
```

Access through the Ingress:

http://localhost:8081 # log line + Ping / Pongs
http://localhost:8081/pingpong # increments the counter


Traffic flow:

localhost:8081 → Traefik → log-output-svc:2345 → reader :3000
├─ reads files/log.txt (emptyDir)
└─ GET http://ping-pong-svc:2345/pings


Logs of each container:
```bash
kubectl logs -n exercises -f deployment/log-output-dep -c writer
kubectl logs -n exercises -f deployment/log-output-dep -c reader
```

## ConfigMap

`manifests/configmap.yaml` (`log-output-config`) provides to the reader:
- the file `information.txt`, mounted at `/usr/src/app/config/information.txt`
- the env variable `MESSAGE`

Both are printed at the top of the `GET /` response.
