TiShadow
========

TiShadow provides Titanium developers the ability to deploy apps or code snippets live across all iOS and Android devices.

There are three parts to TiShadow: the TiShadow server, TiShadow app and TiShadow CLI
for deploying full applications.

~~Have a look at the following [video](http://www.youtube.com/watch?v=xUggUXQArUM) to get any idea of how to use TiShadow and what it can do.~~ (Outdated)

~~Have a look at this [presentation](http://www.slideshare.net/londontitanium/titanium-london-tishadow-july-2012) (July 2012) given at the TiLondon meetup for a look at most of what you can do with TiShadow.~~ (Also outdated but more recent)


Getting Started
===============

TiShadow Install
----------------

TiShadow is built on [node.js](http://nodejs.org/) and is required.

TiShadow can be installed via npm using the following command:

```
  sudo npm install -g tishadow
```


Alternatively you can install TiShadow from the source:

```
  git clone https://github.com/dbankier/TiShadow.git
  cd TiShadow/server
  sudo npm install -g .
```

Since the TiShadow app is not in the App Store ~~or Google Play~~, clone the 
code and run/install as you would any Titanium project.

**NOTE**: I will endevour to update the npm package on significant changes but
might lag, so if the app doesn't seem to be playing nicely install the
server side from source. In general upgrade the server side and app at
the same time.


How To
======

Start TiShadow Server
---------------------

The server can be started by typing the following command:

```
  tishadow server
```

The following options are available:

```
    -h, --help          output usage information
    -p, --port <port>   server port
    -l, --long-polling  force long polling
```

Remote Server Mode and Private Rooms
------------------------------------

**NEW**: The TiShadow Server now support remote hosting with configurable http
ports. It also allow for private "rooms" (much like chat rooms) so that
the TiShadow server can be shared. 

The `tishadow log` command is
available to tail remote server logs (in the default or selected room).

The `tishadow config` command is available to set the default host, port
and room for all the relevant command below.

TiShadow App
------------

Once the server is running launch the app.
From the app just enter the ip address of the computer running the
server and hit connect. There are also more advanced connection settings
that can be used for remote server connections.


Full Application Deployment
---------------------------

Go to the root folder of your project and enter the following command to deploy an app:

```
  tishadow run
```

If the app has been deployed and you want to push minor updates, use the following command:

```
  tishadow run --update
```

Here are full list of options:

```
    -h, --help             output usage information
    -u, --update           Only send recently changed files
    -l, --locale <locale>  set the locale in in the TiShadow app
    -j, --jshint           analyse code with JSHint
    -t, --tail-logs        tail server logs on deploy
    -o, --host <host>      server host name / ip address
    -p, --port <port>      server port
    -r, --room <room>      server room
```


The app is then cached on the device. If need to clear the cache, use
the following command:

```
  tishadow clear
```

__Some notes and limitations__

 * CommonJS modules should be required with their full path.
 * `Ti.include` is partially supported and will work if included with the full path 
    i.e. slash leading.
 * Only files in the Resources directory will will be sent to the device
   using TiShadow. That said, localisation files **are** supported. (see
   options above). 
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
    -h, --help             output usage information
    -u, --update           Only send recently changed files
    -l, --locale <locale>  Set the locale in in the TiShadow app
    -o, --host <host>      server host name / ip address
    -p, --port <port>      server port
    -r, --room <room>      server room
    -j, --jshint           analyse code with JSHint
    -x, --junit-xml        output report as JUnit XML
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
TiShadow supports dynamic localisation. You can also chose the locale 
you wish to use when launching your app/tests. Simply add the
two-letter language code to your command. For example:

```
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
snippet to all connected devices. Have a look at the demo [video](http://www.youtube.com/watch?v=xUggUXQArUM).

**NEW** coding from the webpage now works much like the REPL and variables
are stored in a sandboxed context. See the next section.


TiShadow REPL
-------------

**NEW** The TiShadow REPL is now available and evaluates commands in a
persistant sandboxed context. 

To Launch the REPL enter the following command:

```bash
  tishadow repl
```
With the following options: 

```
    -h, --help         output usage information
    -o, --host <host>  server host name / ip address
    -p, --port <port>  server port
    -r, --room <room>  server room
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


Credits
=======

The server code uses the following and are included:

 * [node.js](http://nodejs.org/)
 * [express](http://expressjs.com/)
 * [socket.io](http://socket.io)
 * [Twitter Bootstrap](http://twitter.github.com/bootstrap/)
 * [Ace](https://github.com/ajaxorg/ace)

The app is built using [Appcelerator](http://www.appcelerator.com/)'s
Titanium.

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




