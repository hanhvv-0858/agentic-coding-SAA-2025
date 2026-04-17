.PHONY: up dev down test e2e check analyze typecheck lint format

up:
	@echo "Starting local Supabase stack..."
	supabase start
	@echo "Supabase ready. Copy credentials into .env.development (auto-generated)."

dev:
	yarn dev --turbo

down:
	supabase stop

test:
	yarn test --run

e2e:
	yarn e2e

lint:
	yarn lint

typecheck:
	yarn typecheck

format:
	yarn format

analyze:
	yarn analyze

# Pre-push gate mirroring CI (constitution "Development Workflow").
check: lint typecheck test
