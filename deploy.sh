git checkout master
git merge develop
git push
cd public
make
cd -
af update blog-thomasbelin
#phantomjs scripts/snapshots.js
git checkout develop
