#!/bin/bash
# Script to deploy Convex to the correct project (abundant-narwhal-987)

cd "$(dirname "$0")"

echo "⚠️  This will deploy to the production deployment of project: abundant-narwhal-987"
echo "⚠️  Make sure you're authenticated with the correct Convex account"
echo ""
echo "To link to the correct project, you need to:"
echo "1. Run: npx convex dev"
echo "2. Select: 'choose an existing project'"
echo "3. Select: 'abundant-narwhal-987' (or the project name that contains this deployment)"
echo ""
echo "After linking, you can deploy with:"
echo "  npx convex deploy --typecheck=disable --yes"
echo ""
read -p "Press Enter to continue with deployment (or Ctrl+C to cancel)..."

# Deploy with typecheck disabled
npx convex deploy --typecheck=disable --yes


