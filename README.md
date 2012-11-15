TiShadow
========

TiShadow provides Titanium developers the ability to deploy apps or code snippets live across all iOS and Android devices.

There are three parts to TiShadow: the TiShadow server, TiShadow app and TiShadow CLI
for deploying full applications.

~~Have a look at the following [video](http://www.youtube.com/watch?v=xUggUXQArUM) to get any idea of how to use TiShadow and what it can do.~~ (Outdated)
~~Have a look at this [presentation](http://www.slideshare.net/londontitanium/titanium-london-tishadow-july-2012) (July 2012) given at the TiLondon meetup for a look at most of what you can do with TiShadow.~~ (Also outdated but more recent)


Getting Started
===============


TiShadow Server Install
-----------------------

TiShadow can be installed via npm using the following command:

```bash
  sudo npm install -g tishadow
```

**NOTE**: I will endevour to update the npm package on significant changes but
might lag, so if the app doesn't seem to be playing nicely install the
server side from source. In general upgrade the server side and app at
the same time.

Once installed, the server can be started by typing the following
command:

```bash
  tishadow server
```

The server code uses the following and are included:

 * [node.js](http://nodejs.org/)
 * [express] (http://expressjs.com/)
 * [socket.io] (http://socket.io)
 * [Twitter Bootstrap](http://twitter.github.com/bootstrap/)
 * [Ace](https://github.com/ajaxorg/ace)



TiShadow Server Install From Source
-----------------------------------

After cloning the server code, make sure you run the following to
install dependancies:

```bash
    npm install -d
```

The server can then be started like any nodejs app:

```bash
    node app.js
```


TiShadow App
------------

The app is built using [Appcelerator](http://www.appcelerator.com/)'s
Titanium.

**TiShadow NO LONGER REQUIRES A CUSTOM SDK**

TiShadow App uses some third-party native modules - see the end of the
README.

Since the TiShadow app is not in the App Store ~~or Google Play~`, clone the 
code and run/install as you would any Titanium project.


How To
======

Common Tasks
------------

Fire up the server and launch the app.
From the app just enter the ip address of the computer running the node
server and hit connect.

Full Application Deployment
---------------------------

If you installed TiShadow using npm, go to the root folder of your
project and enter the following command to deploy an app:

```bash
  tishadow run
```

(For manual installs, the `tishadow` script is included in the build folder. You may want to include the script in your
environment path.)

If the app has been deployed and you want to push minor updates, use the following command:

```bash
  tishadow run --update
```

Here are full list of options:

```
 $ tishadow run --help

  Usage: run [options]

  Options:

    -h, --help             output usage information
    -u, --update           Only send recently changed files
    -l, --locale <locale>  Set the locale in in the TiShadow app
    -t, --tail-logs        Tail server logs on deploy
```


The app is then cached on the device. If need to clear the cache, use
the following command:

```bash
  tishadow clear
```

__Some notes and limitations__

 * CommonJS modules should be required with their full path.
 * `Ti.include` is partially supported and will work if included with the full path 
    i.e. slash leading.
 * Only files in the Resources directory will will be sent to the device
   using TiShadow. That said, localisation files **are** supported. (see
   options above. 
 * Native modules _can_ be supported if built into the TiShadow app
   first. (I.e., add them to the tiapp.xml of the TiShadow app.)
 * If there any errors about a Titanium SDK command not being found, add
   them to the Includes.js files and clean and build the TiShadow app. (I
   will gradually be adding commands.)
 * Any Ti.API logs will be redirected to the server logs and webpage.


If you want to make sure the previous app deployed is closed prior to
updating or launching the new one, include the following code snippet in your
`app.js` file:

```javascript
    try {
      exports.close = function() {
        // Your code to close, e.g, main_window.close();
      };
      Ti.API.info("Running in TiShadow");
    } catch (e) {
      Ti.API.info("Running stand-alone");
    }
```


Testing / Assertions
--------------------

TiShadow now support [Jasmine](http://pivotal.github.com/jasmine/) BDD tests. 
Insipration taken from these two projects: [titanium-jasmine](https://github.com/guilhermechapiewski/titanium-jasmine/) and [jasmine-titanium](https://github.com/akahigeg/jasmine-titanium)

Include your specs in the `Resources/spec` path of your project. Ensure
the files are ending in `_spec.js`. (Note: simply write the spec without any including/requiring the jasmine library.)

To execute the tests enter the following command:

```bash
  tishadow spec
```

Here are a full list of options:

```
 $ ./tishadow spec --help

  Usage: spec [options]

  Options:

    -h, --help             output usage information
    -u, --update           Only send recently changed files
    -l, --locale <locale>  Set the locale in in the TiShadow app
    -j, --jshint           Analyse code with JSHint
    -x, --junit-xml        Output report as JUnit XML
```

**NOTE** the new `--junit-xml` option.

The test results will be returned to the server output:
![Spec Output](http://github.com/dbankier/TiShadow/raw/master/example/spec.png)

See the included example project.


_Alternatively (yet not preferred)_

TiShadow also supports the use of assertions and the results are
returned either to the browser or server logs.
 
For example:

```javascript
    assert.isNumber(6, "Testing if 6 is a number");
    assert.isArray([1,2,3,4], "Testing if it is an array");
```

The following assertion are supported:
'equal', 'strictEqual', 'deepEqual', 'isTrue', 'isFalse',
'isEmpty', 'isElement', 'isArray','isObject', 'isArguments', 'isFunction',
'isString', 'isNumber', 'isFinite', 'isBoolean', 'isDate', 'isRegExp', 'isNaN', 'isNull',
'isUndefined', 'lengthOf', 'match', 'has'

Also the equivalent not assertions are available as well, e.g.
'notEqual', 'isNotString', 'isNotNumber', etc.
 

Configurable Localisation
-------------------------
TiShadow now supports localisation. You can also chose the locale 
you wish to use when launching your app/tests. Simply add the
two-letter language code to your command. For example:

```bash
  tishadow run --locale es
  tishadow spec --locale nl
```

Code Snippets Via Webpage
-------------------------
 
Enter the following address in a browser window:

```
    http://localhost:3000/
```

In the editor you can enter code and press Command+s to deploy the code
snippet to all connected devices.

Have a look at the demo [video](http://www.youtube.com/watch?v=xUggUXQArUM).

**NEW** coding from the webpage now works much like a REPL and variables
are stored in a sandboxed context. See the next section.


TiShadow REPL
-------------

**NEW** The TiShadow REPL is now available and evaluates commands in a
persistant sandboxed context. 

To Launch the REPL enter the following command:

```bash
  tishadow repl
```

`launchApp(appName)`, `closeApp()` and `clearCache()` methods available
to interact with apps cached in the TiShadow app.

`require()`, `Ti.include()` and assests are relative the running app
inside the TiShadow app.


Launch From Web
---------------

_Currently only working on iOS_

You can also use TiShadow to bundle an app and launch it from a web
page. You the command `tishadow bundle` to bundle the app for a
TiShadow distribution. Then include a link to the bundle in your webpage
using the following format, e.g. : `tishadow://mydomain.com/bundle.zip`.
Tapping on the link from your browser should launch the app in TiShadow.


VIM Shortcuts
-------------
Those using vim/gvim/mvim for development might what to add these
shortcuts (or similar) to the .vimrc/.gvimrc files. It adds the shortcuts, F6
to save and do a tishadow update, and Shift+F6 to save and perform a full
tishadow deploy:

```
    :map <F6> <Esc>:w<CR>:!tishadow run --update<CR>a
    :imap <F6> <Esc>:w<CR>:!tishadow run --update<CR>a
    :map <S-F6> <Esc>:w<CR>:!tishadow run<CR>a
    :imap <S-F6> <Esc>:w<CR>:!tishadow run<CR>a 
```


Third Party Modules
-------------------

### Websockets/Socket.IO
####iPhone/Android
Copyright 2012 jordi domenech jordi@iamyellow.net Apache License, Version 2.0

[Github Repo](https://github.com/iamyellow/tiws)


### ZIP Modules

The Zip Modules have been taken from other open source projects.

####iPhone Module
This module was  developed by Gennadiy Potatov with updates
from Kosso. It is MIT Licensed and has been included with no changes to
the original code. 

[Github Repo](https://github.com/TermiT/ZipFile)

####Android Module

This module's source was originally developed by Henri Bourcereau. It was
released under an MIT License. It has been modified slightly and built for 1.8+. 

[Henri's Github Repo](https://github.com/websiteburo/androzip)


Feedback appreciated.

@davidbankier



