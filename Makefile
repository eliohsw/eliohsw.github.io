SHELL := /bin/zsh
.DEFAULT_GOAL := serve

PORT ?= 4000
LIVERELOAD_PORT ?= 35729
FUTURE ?=
t ?=
QUIET ?= 0

ifeq ($(QUIET),1)
JEKYLL_FLAGS := --quiet
endif

.PHONY: serve future clean

serve:
	@export RBENV_VERSION=3.4.5; \
	export PATH="$$HOME/.rbenv/shims:$$HOME/.rbenv/bin:$$PATH"; \
	IP="$$(ipconfig getifaddr en0 2>/dev/null || true)"; \
	[[ -z $$IP ]] && IP="$$(ipconfig getifaddr en1 2>/dev/null || true)"; \
	[[ -z $$IP ]] && IP="127.0.0.1"; \
	if lsof -ti tcp:$(PORT) >/dev/null 2>&1; then \
	  echo "Stopping existing server on :$(PORT)…"; \
	  kill $$(lsof -ti tcp:$(PORT)) 2>/dev/null || true; \
	fi; \
	echo "Starting Jekyll at http://$${IP}:$(PORT) \n"; \
	bundle exec jekyll clean $(JEKYLL_FLAGS); \
	if [[ -n "$(t)" ]]; then \
	  echo "Auto-stopping after $(t)s…"; \
	  bundle exec jekyll serve --config _config.yml --host $${IP} --port $(PORT) --livereload --livereload-port $(LIVERELOAD_PORT) $(FUTURE) $(JEKYLL_FLAGS) & \
	  JEKYLL_PID=$$!; \
	  (sleep $(t); echo "Stopping Jekyll after $(t)s…"; kill -INT $$JEKYLL_PID 2>/dev/null || true) & \
	  TIMER_PID=$$!; \
	  wait $$JEKYLL_PID; \
	  kill $$TIMER_PID 2>/dev/null || true; \
	else \
	  bundle exec jekyll serve --config _config.yml --host $${IP} --port $(PORT) --livereload --livereload-port $(LIVERELOAD_PORT) $(FUTURE) $(JEKYLL_FLAGS); \
	fi

future:
	@$(MAKE) serve FUTURE=--future

clean:
	@export RBENV_VERSION=3.4.5; \
	export PATH="$$HOME/.rbenv/shims:$$HOME/.rbenv/bin:$$PATH"; \
	bundle exec jekyll clean
