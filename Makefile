SHELL := /bin/zsh
.DEFAULT_GOAL := serve

PORT ?= 4000
LIVERELOAD_PORT ?= 35729
FUTURE ?=
t ?=
QUIET ?= 0
PYTHON ?= python3
REDIRECTS_CONTENT ?= _content_redirects
JEKYLL_CONFIG ?= _config.yml,_config.redirects.yml
RUBY_VERSION ?= 3.4.5
BASEURL ?=

ifeq ($(QUIET),1)
JEKYLL_FLAGS := --quiet
endif

.PHONY: serve future clean redir build ci

ci: build

build: redir
	@export RBENV_VERSION=$(RUBY_VERSION); \
	export PATH="$$HOME/.rbenv/shims:$$HOME/.rbenv/bin:$$PATH"; \
	JEKYLL_ENV=production bundle exec jekyll build --config $(JEKYLL_CONFIG) --baseurl "$(BASEURL)" $(JEKYLL_FLAGS)

serve: redir
	@export RBENV_VERSION=$(RUBY_VERSION); \
	export PATH="$$HOME/.rbenv/shims:$$HOME/.rbenv/bin:$$PATH"; \
	IP="$$(ipconfig getifaddr en0 2>/dev/null || true)"; \
	[[ -z $$IP ]] && IP="$$(ipconfig getifaddr en1 2>/dev/null || true)"; \
	[[ -z $$IP ]] && IP="127.0.0.1"; \
	if lsof -ti tcp:$(PORT) >/dev/null 2>&1; then \
	  echo "Stopping existing server on :$(PORT)…"; \
	  kill $$(lsof -ti tcp:$(PORT)) 2>/dev/null || true; \
	fi; \
	echo "Starting Jekyll at http://$${IP}:$(PORT) \n"; \
	bundle exec jekyll clean --config $(JEKYLL_CONFIG) $(JEKYLL_FLAGS); \
	if [[ -n "$(t)" ]]; then \
	  echo "Auto-stopping after $(t)s…"; \
	  bundle exec jekyll serve --config $(JEKYLL_CONFIG) --host $${IP} --port $(PORT) --livereload --livereload-port $(LIVERELOAD_PORT) $(FUTURE) $(JEKYLL_FLAGS) & \
	  JEKYLL_PID=$$!; \
	  (sleep $(t); echo "Stopping Jekyll after $(t)s…"; kill -INT $$JEKYLL_PID 2>/dev/null || true) & \
	  TIMER_PID=$$!; \
	  wait $$JEKYLL_PID; \
	  kill $$TIMER_PID 2>/dev/null || true; \
	else \
	  bundle exec jekyll serve --config $(JEKYLL_CONFIG) --host $${IP} --port $(PORT) --livereload --livereload-port $(LIVERELOAD_PORT) $(FUTURE) $(JEKYLL_FLAGS); \
	fi

future:
	@$(MAKE) serve FUTURE=--future

clean:
	@export RBENV_VERSION=$(RUBY_VERSION); \
	export PATH="$$HOME/.rbenv/shims:$$HOME/.rbenv/bin:$$PATH"; \
	if command -v bundle >/dev/null 2>&1; then \
	  bundle exec jekyll clean --config $(JEKYLL_CONFIG) $(JEKYLL_FLAGS); \
	fi; \
	rm -rf _site .jekyll-cache .jekyll-metadata .sass-cache; \
	if [[ -f "$(REDIRECTS_CONTENT)/.redirects-generated" ]]; then \
	  rm -rf "$(REDIRECTS_CONTENT)"; \
	fi

redir:
	@$(PYTHON) scripts/redirect.py --source _content --dest $(REDIRECTS_CONTENT)
