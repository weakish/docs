#!/bin/bash
set -x -e

DIST=$(mktemp -d /tmp/docs.XXXXXXXX)

GIT_REPO="$1"
TARGET="$2"
DOC_COMMENT_TOKEN="$3"

git clone "$GIT_REPO" "$DIST"
rm -rf "$DIST"/*

rm -rf dist/*
rm -rf md/*

node --version
npm --version

npm install

export DOC_ENV="$TARGET"
export DOC_COMMENT_TOKEN="$DOC_COMMENT_TOKEN"

if [ "$TARGET" = "qcloud" ]; then
    npx grunt build --theme=qcloud
elif [ "$TARGET" = "us" ]; then
    npx grunt build --theme=us --no-comments
else
    npx grunt build
fi

cp -r dist/* "$DIST"

pushd "$DIST"
git add -A :/  # `:/` is a pathspec matching the root of working tree
git commit -a -m "Updated at $(date -R)"
git push origin +master
popd

rm -rf "$DIST"
