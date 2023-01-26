for pckg in ketcher-core ketcher-react ketcher-standalone; do
  echo $pckg
  (cd ./packages/$pckg && npm run build)
done

(cd ./example && npm run build)

echo "\n\nDone"