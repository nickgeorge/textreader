#!/bin/bash

chsum1=""

while [[ true ]]
do
    chsum2=`find client/soy/* -type f -exec md5sum {} \;`
    if [[ $chsum1 != $chsum2 ]] ; then
        echo "Recompiling soy..."
        result=$(java -jar ~/Desktop/SoyToJsSrcCompiler.jar \
            --outputPathFormat bin/{INPUT_FILE_NAME}.js \
            --allowExternalCalls false \
            client/soy/*.soy)
        if [ ! -z "$result" ]; then
          echo $result
        fi
        echo "Done"

        chsum1=$chsum2
    fi
    sleep 2
done
