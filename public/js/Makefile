all: public admin

public:
	cat src/application.js main.js > temp.js
	r.js -o name=js/temp out=build/application.js mainConfigFile=temp.js baseUrl=../
	rm temp.js

admin:
	cat src/application.js src/application.admin.js main.js > temp.js
	r.js -o name=js/temp out=build/application.admin.js mainConfigFile=temp.js baseUrl=../
	rm temp.js
