#!/bin/bash
# Copy built Quarto presentation artifacts from source repo to this project
#
# Usage: ./scripts/copy-presentations.sh /path/to/presentations-repo
#
# Expected source structure (Quarto project output):
#   presentations-repo/
#     _site/
#       my-presentation/
#         index.html
#         index_files/
#
# Output structure:
#   public/pages/presentations/
#     my-presentation/
#       index.html
#       index_files/

set -e

SOURCE_REPO="${1:-../presentations}"
DEST_DIR="$(dirname "$0")/../public/pages/presentations"

if [ ! -d "$SOURCE_REPO" ]; then
    echo "Error: Source repo not found at $SOURCE_REPO"
    echo "Usage: $0 /path/to/presentations-repo"
    exit 1
fi

# Quarto renders to _site/ at the project level
SITE_DIR="$SOURCE_REPO/_site"

if [ ! -d "$SITE_DIR" ]; then
    echo "Error: No _site directory found at $SITE_DIR"
    echo "Run 'quarto render' in the presentations repo first."
    exit 1
fi

echo "📦 Copying presentations from $SITE_DIR to $DEST_DIR"

# Loop through each presentation directory in _site
for pres_dir in "$SITE_DIR"/*/; do
    pres_name=$(basename "$pres_dir")
    
    # Skip hidden directories
    if [[ "$pres_name" == .* ]]; then
        continue
    fi
    
    # Check for index.html
    if [ ! -f "$pres_dir/index.html" ]; then
        echo "⚠️  Skipping $pres_name (no index.html found)"
        continue
    fi
    
    dest_path="$DEST_DIR/$pres_name"
    
    echo "  → Copying $pres_name..."
    rm -rf "$dest_path"
    mkdir -p "$dest_path"
    cp -r "$pres_dir"/* "$dest_path/"
    
    echo "  ✓ $pres_name copied successfully"
done

echo ""
echo "✅ Presentations copied successfully!"
echo ""
echo "Don't forget to update data/presentations.json with any new presentations."
