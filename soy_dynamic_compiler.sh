#!/bin/bash

# Simple dynamic compiler for soy.
# While running, any soy files in client/soy will be monitored for
# changes, and will recompile all soy files to client/soy/gen
# if any are changed.

oldSum=""

while [[ true ]]
do
    newSum=`find client/soy/* -type f -exec md5sum {} \;`
    if [[ $oldSum != $newSum ]] ; then
        echo "Recompiling soy..."
        result=$(java -jar SoyToJsSrcCompiler.jar \
            --outputPathFormat client/soy/gen/{INPUT_FILE_NAME}.js \
            --allowExternalCalls false \
            client/soy/*.soy)
        if [ ! -z "$result" ]; then
          echo $result
        fi
        echo "Done"

        oldSum=$newSum
    fi
    sleep 2
done
