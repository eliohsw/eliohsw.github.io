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
JEKYLL_CONFIG_DEV ?= _config.yml
RUBY_VERSION ?= 3.4.5
BASEURL ?=

ifeq ($(QUIET),1)
JEKYLL_FLAGS := --quiet
endif

JEKYLL_ENV_SETUP := export RBENV_VERSION=$(RUBY_VERSION); \
	export PATH="$$HOME/.rbenv/shims:$$HOME/.rbenv/bin:$$PATH";
IP_DETECT := IP="$$(ipconfig getifaddr en0 2>/dev/null || true)"; \
	[[ -z $$IP ]] && IP="$$(ipconfig getifaddr en1 2>/dev/null || true)"; \
	[[ -z $$IP ]] && IP="127.0.0.1";
STOP_SERVER := if lsof -ti tcp:$(PORT) >/dev/null 2>&1; then \
	echo "Stopping existing server on :$(PORT)…"; \
	kill $$(lsof -ti tcp:$(PORT)) 2>/dev/null || true; \
fi;
JEKYLL_CLEAN_CMD = bundle exec jekyll clean --config $(1) $(JEKYLL_FLAGS)
JEKYLL_SERVE_CMD = bundle exec jekyll serve --config $(1) --host $${IP} --port $(PORT) --livereload --livereload-port $(LIVERELOAD_PORT) $(FUTURE) $(JEKYLL_FLAGS)
SERVE_WITH_CONFIG = if [[ -n "$(t)" ]]; then \
	echo "Auto-stopping after $(t)s…"; \
	$(call JEKYLL_SERVE_CMD,$(1)) & \
	JEKYLL_PID=$$!; \
	(sleep $(t); echo "Stopping Jekyll after $(t)s…"; kill -INT $$JEKYLL_PID 2>/dev/null || true) & \
	TIMER_PID=$$!; \
	wait $$JEKYLL_PID; \
	kill $$TIMER_PID 2>/dev/null || true; \
else \
	$(call JEKYLL_SERVE_CMD,$(1)); \
fi

.PHONY: serve dev future clean redir build ci

ci: build

build: redir
	@$(JEKYLL_ENV_SETUP) \
	JEKYLL_ENV=production bundle exec jekyll build --config $(JEKYLL_CONFIG) --baseurl "$(BASEURL)" $(JEKYLL_FLAGS)

serve: redir
	@$(JEKYLL_ENV_SETUP) \
	$(IP_DETECT) \
	$(STOP_SERVER) \
	echo "Starting Jekyll at http://$${IP}:$(PORT) \n"; \
	$(call JEKYLL_CLEAN_CMD,$(JEKYLL_CONFIG)); \
	$(call SERVE_WITH_CONFIG,$(JEKYLL_CONFIG))

dev:
	@$(JEKYLL_ENV_SETUP) \
	$(IP_DETECT) \
	$(STOP_SERVER) \
	echo "Starting Jekyll (dev config) at http://$${IP}:$(PORT) \n"; \
	$(call JEKYLL_CLEAN_CMD,$(JEKYLL_CONFIG_DEV)); \
	$(call SERVE_WITH_CONFIG,$(JEKYLL_CONFIG_DEV))

future:
	@$(MAKE) serve FUTURE=--future

clean:
	@$(JEKYLL_ENV_SETUP) \
	if command -v bundle >/dev/null 2>&1; then \
	  $(call JEKYLL_CLEAN_CMD,$(JEKYLL_CONFIG)); \
	fi; \
	rm -rf _site .jekyll-cache .jekyll-metadata .sass-cache; \
	if [[ -f "$(REDIRECTS_CONTENT)/.redirects-generated" ]]; then \
	  rm -rf "$(REDIRECTS_CONTENT)"; \
	fi

redir:
	@$(PYTHON) scripts/redirect.py --source _content --dest $(REDIRECTS_CONTENT)
