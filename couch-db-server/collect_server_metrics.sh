#!/bin/bash

if [ $1 == '-h' ] || [ $1 == '--help' ] || [ -z $1 ]
then
    echo "Usage: 
        first arg -  number of process to observe
        second arg - directory to write res without last '\'
        third arf - file to write res
    "
    exit 0
fi

if [ ! -d "$2" ]
then
    mkdir "$2"
fi

pidstat -h -d -r -u -p $1 1 | grep --line-buffered '^[0-9]' > "$2/$3"