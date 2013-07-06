git checkout master
git merge develop
git tag deploy
git push
cd public
make
cd -
af update blog-thomasbelin
#phantomjs scripts/snapshots.js
git checkout develop
