FROM docker/couchdb:latest
RUN apt-get -y update && apt-get install -y sysstat
# COPY ./
# TODO: add copy of the script which create file

CMD ["/opt/couchdb/bin/couchdb"]