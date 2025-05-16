name: Update Sharks Hourly

on:
  schedule:
    - cron: '5 * * * *'  # 5 minutes past the hour
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository (full history)
        uses: actions/checkout@v3
        with:
          fetch-depth: 0  # Needed to push changes

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'

      - name: Install dependencies
        run: pip install pandas

      - name: Run shark update script
        run: python sharks_tracker.py  # ✅ fixed filename and path

      - name: Commit and push updated sharks.json
        run: |
          git config user.name "whalewatch-bot"
          git config user.email "actions@github.com"
          git pull origin main --rebase || echo "No remote changes to rebase"
          git add public/sharks.json
          git commit -m "🦈 Update sharks.json (hourly sync)" || echo "No changes to commit"
          git push --force
