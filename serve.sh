#!/bin/zsh

export PATH="$HOME/.rbenv/bin:$PATH"
eval "$(rbenv init - zsh)"
rbenv shell 3.4.5

IP="$(ipconfig getifaddr en0 2>/dev/null || true)"
[[ -z $IP ]] && IP="$(ipconfig getifaddr en1 2>/dev/null || true)"
[[ -z $IP ]] && IP="127.0.0.1"

if lsof -ti tcp:4000 >/dev/null 2>&1; then
  echo "Stopping existing server on :4000…"
  kill $(lsof -ti tcp:4000) 2>/dev/null || true
fi

echo "Starting Jekyll at http://${IP}:4000 \n"
bundle exec jekyll serve --host 0.0.0.0 --port 4000 --detach