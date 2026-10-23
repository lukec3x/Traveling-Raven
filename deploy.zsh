#!/bin/zsh
cd "${0:A:h}" || exit 1

echo -n "Senha FTP: "
read -s FTP_PASS
echo

if [[ -z "$FTP_PASS" ]]; then
  echo "Senha vazia."
  exit 1
fi

# FTP login opens in www/. The public site is the domain folder inside it.
BASE="ftp://travelingraven.com.br/travelingraven.com.br"

upload() {
  curl --silent --show-error --fail --ftp-create-dirs --ftp-skip-pasv-ip \
    --user "josdes15:${FTP_PASS}" \
    -T "$1" "$BASE/$1"
}

for f in index.html send.html receive.html robots.txt css/style.css js/script.js; do
  upload "$f" || exit 1
  echo "ok $f"
done

while IFS= read -r -d '' f; do
  upload "$f" || exit 1
  echo "ok $f"
done < <(find img -type f ! -name '.DS_Store' -print0)

unset FTP_PASS

if curl -fsS --max-time 20 http://travelingraven.com.br/ | grep -q 'href="send.html"'; then
  echo "site atualizado"
else
  echo "o FTP aceitou os arquivos, mas a home publicada ainda não aponta para send.html"
  exit 1
fi
