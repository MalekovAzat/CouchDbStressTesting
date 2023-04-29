#!/bin/bash

#usage ./delete_all_db.sh <path to server>
#example ./delete_all_db.sh http://127.0.0.1:5984/

if [ -z "$1" ]
then
    echo 'Add server url as argument'
    exit 1
fi

dbsStr=$(curl -X GET "$1_all_dbs")

dbList=$(echo "$dbsStr" | grep -o -E 'id-.{36}')

for db in $dbList
do
    echo "deliting db: $db"
    curl -s -X DELETE "$1$db"
done

echo "Done"