# Historical Faith Narrative - Makefile
# Usage: make <target>

.PHONY: setup install generate generate-enhanced push status clean help

# Default target
help:
	@echo "Historical Faith Narrative - Available Commands"
	@echo "================================================"
	@echo ""
	@echo "  make setup           - Create virtual environment and install dependencies"
	@echo "  make install         - Install Python dependencies only"
	@echo "  make generate        - Run basic generation (8.5/10 quality)"
	@echo "  make generate-enhanced - Run enhanced generation (9.5/10 quality)"
	@echo "  make generate-era N=X - Generate specific era (1-10)"
	@echo "  make push            - Commit and push all changes to GitHub"
	@echo "  make status          - Show current generation status"
	@echo "  make test-apis       - Test all API connections"
	@echo "  make clean           - Remove generated content (use with caution)"
	@echo ""

# Setup virtual environment
setup:
	python3 -m venv venv
	. venv/bin/activate && pip install -r scripts/requirements.txt
	@echo "Setup complete. Run 'source venv/bin/activate' to activate."

# Install dependencies only
install:
	. venv/bin/activate && pip install -r scripts/requirements.txt

# Run basic generation (all eras)
generate:
	. venv/bin/activate && python -u scripts/generation/generate_all_eras.py

# Run enhanced generation (all eras, 9.5/10 quality)
generate-enhanced:
	. venv/bin/activate && python -u scripts/generation/generate_enhanced_eras.py

# Generate specific era (usage: make generate-era N=3)
generate-era:
ifndef N
	@echo "Error: Specify era number with N=X (e.g., make generate-era N=3)"
else
	. venv/bin/activate && python -u scripts/generation/generate_enhanced_eras.py $(N)
endif

# Test all API connections
test-apis:
	. venv/bin/activate && python scripts/config.py

# Show status of generated content
status:
	@echo "Generated Content Status"
	@echo "========================"
	@echo ""
	@echo "Markdown files:"
	@ls -la content/eras/*.md 2>/dev/null || echo "  No markdown files yet"
	@echo ""
	@echo "JSON data files:"
	@ls -la data/*.json 2>/dev/null || echo "  No JSON files yet"
	@echo ""
	@echo "File sizes:"
	@wc -l content/eras/*.md 2>/dev/null || echo "  N/A"

# Commit and push to GitHub
push:
	cd .. && git add -A && \
	git commit -m "Update Historical Faith Narrative content - $$(date '+%Y-%m-%d %H:%M')" && \
	git push origin master
	@echo "Pushed to GitHub successfully!"

# Push with custom message (usage: make push-msg MSG="your message")
push-msg:
ifndef MSG
	@echo "Error: Specify commit message with MSG=\"your message\""
else
	cd .. && git add -A && \
	git commit -m "$(MSG)" && \
	git push origin master
endif

# Clean generated content (use with caution!)
clean:
	@echo "WARNING: This will delete all generated content!"
	@read -p "Are you sure? (y/N) " confirm && [ "$$confirm" = "y" ] && \
	rm -f content/eras/*.md data/*.json || echo "Cancelled."

# Quick development workflow
dev:
	@echo "Starting development workflow..."
	. venv/bin/activate && python -c "from scripts.config import test_all_connections; test_all_connections()"
