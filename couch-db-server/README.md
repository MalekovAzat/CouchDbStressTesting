# Description

Repository `couch-db-server` contains `Dokcerfile` which need to create docker-container with couchDB server.

Repository `couch-db-server` contains `docker.ini` which should be mounted in couchdb container.

To start server in docker execute:

```bash
# an image creation
docker build -t test-server:latest .
# run a container
docker run \
    -p 5984:5984 \
    -e COUCHDB_USER=admin \
    -e COUCHDB_PASSWORD=password \
    -v "$(pwd)"/config:/opt/couchdb/etc/local.d/ \
    -v "$(pwd)"/data:/opt/couchdb/data \
    -v "$(pwd)"/server_metrics:/server_metrics \
    --name test-server \
    -d \
    test-server
```
