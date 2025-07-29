#!/bin/bash
#
# Create a new releease
#
# - increment version number by 1
# - update version in package.json
# - push a new release to Github
# - trigger new image build
#

set -e

BUILD_URL="https://github.com/tradingstrategy-ai/social-media-bot/pkgs/container/social-media-bot"

# Get tags from remote
git fetch --all

# Get latest version (using version sort instead of commit date)
CURRENT_VERSION=$(git tag --sort=version:refname | tail -1 || echo "v0")
CURRENT_NUM=${CURRENT_VERSION#v}
NEXT_NUM=$((CURRENT_NUM + 1))
NEW_TAG="v$NEXT_NUM"

# Show context
LATEST_COMMIT=$(git log --oneline -1)
echo "Latest commit: $LATEST_COMMIT"
echo "Current version: $CURRENT_VERSION"
echo "New version: $NEW_TAG"

# Confirm release
read -r -p "Create tag $NEW_TAG? [y/N] " response
case "$response" in
    [yY][eE][sS]|[yY])
        echo "Creating tag $NEW_TAG..."
        ;;
    *)
        echo "Tag creation cancelled"
        exit 1
        ;;
esac

# Update package.json
npm pkg set version="$NEXT_NUM"

# Commit and tag
git add package.json
git commit -m "Bump version to $NEW_TAG"
git tag "$NEW_TAG"
git push && git push --tags

echo "✅ Tag $NEW_TAG pushed to repository"
echo "📦 Docker build starting - find the build at $BUILD_URL"
