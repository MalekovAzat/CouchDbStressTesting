FROM couchdb:latest

RUN apt-get -y update && apt-get install -y sysstat

COPY ./collect_server_metrics.sh .

RUN chmod +x /collect_server_metrics.sh

CMD ["/opt/couchdb/bin/couchdb"]