# Log output

Two containers in a single pod, sharing an `emptyDir` volume mounted at `/usr/src/app/files`:

- **writer**: generates a random string (UUID) on startup and appends a line with the timestamp and the string to `files/log.txt` every 5 seconds.
- **reader**: serves the content of `files/log.txt` at `GET /`.

```
2026-10-07T07:12:44.522Z: 83a96113-7bbc-49b9-b635-0fc2b3f2c35b
2026-10-07T07:12:49.534Z: 83a96113-7bbc-49b9-b635-0fc2b3f2c35b
```

The file is lost when the pod is deleted (`emptyDir`).

## Configuration

| Container | Variable | Description | Default |
|---|---|---|---|
| reader | `PORT` | Port the HTTP server listens on | `3000` |

## Project structure

```
log_output/
├── writer/               # writes the log file
│   ├── index.js
│   ├── package.json
│   └── Dockerfile
├── reader/               # serves the log file over HTTP
│   ├── index.js
│   ├── package.json
│   └── Dockerfile
└── manifests/
    ├── deployment.yaml   # 1 pod, 2 containers, shared emptyDir
    ├── service.yaml      # ClusterIP Service (2345 -> 3000, the reader)
    └── ingress.yaml      # Ingress: / -> log-output-svc, /pingpong -> ping-pong-svc
```

## Docker

```bash
docker build -t nikosmrb/log_output_writer:1.10 writer/
docker build -t nikosmrb/log_output_reader:1.10 reader/
```

Images on Docker Hub:
- [`nikosmrb/log_output_writer`](https://hub.docker.com/r/nikosmrb/log_output_writer)
- [`nikosmrb/log_output_reader`](https://hub.docker.com/r/nikosmrb/log_output_reader)

## Kubernetes

Create the cluster (port 8081 on the host is mapped to the Ingress on port 80):
```bash
k3d cluster create --port 8082:30080@agent:0 -p 8081:80@loadbalancer --agents 2
```

Deploy:
```bash
kubectl apply -f manifests/
kubectl get pods        # READY 2/2
```

Access through the Ingress:
```
http://localhost:8081
```
Traffic flow: `localhost:8081` → Traefik → `log-output-svc:2345` → pod `:3000` (reader) → reads `files/log.txt`

Logs of each container:
```bash
kubectl logs -f deployment/log-output-dep -c writer
kubectl logs -f deployment/log-output-dep -c reader
```

The same Ingress also routes `/pingpong` to the ping-pong application (`../ping_pong`).
