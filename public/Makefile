JS_DIR=js/
CSS_DIR=css/

BUILD_DIR=build/
JS_BUILD_DIR=$(BUILD_DIR)$(JS_DIR)
CSS_BUILD_DIR=$(BUILD_DIR)$(CSS_DIR)

PUBLIC_JS_FILES= \
				$(JS_DIR)src/application.js\
				$(JS_DIR)main.js

ADMIN_JS_FILES= \
				$(JS_DIR)src/application.js\
				$(JS_DIR)src/application.admin.js\
				$(JS_DIR)main.js

PUBLIC_CSS_FILES= \
				$(CSS_DIR)application.css\
				$(CSS_DIR)font-awesome.min.css\
				$(CSS_DIR)code-themes/custom.css

ADMIN_CSS_FILES= \
				$(CSS_DIR)application.css\
				$(CSS_DIR)admin.css\
				$(CSS_DIR)font-awesome.min.css\
				$(CSS_DIR)code-themes/custom.css

all: public admin

public: public_css public_js

admin: admin_css admin_js

public_css:
	cat $(PUBLIC_CSS_FILES) > temp.css
	r.js -o optimizeCss=standard cssIn=temp.css out=$(CSS_BUILD_DIR)application.css
	rm temp.css

public_js:
	cat $(PUBLIC_JS_FILES) > temp.js
	r.js -o name=temp out=$(JS_BUILD_DIR)application.js mainConfigFile=temp.js baseUrl=.
	rm temp.js

admin_css:
	cat $(ADMIN_CSS_FILES) > temp.css
	r.js -o optimizeCss=standard cssIn=temp.css out=$(CSS_BUILD_DIR)application.admin.css
	rm temp.css

admin_js:
	cat $(ADMIN_JS_FILES) > temp.js
	r.js -o name=temp out=$(JS_BUILD_DIR)application.admin.js mainConfigFile=temp.js baseUrl=.
	rm temp.js

admin: admin_css admin_js
