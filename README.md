TiShadow
========

TiShadow provides Titanium developers the ability to write code snippets in a browser
and render the code across all iOS and Android devices. **NEW** TiShadow now
also allows the deployment of apps to devices. There are three
parts to TiShadow: the TiShadow server, TiShadow app and build scripts
for deploying full applications.

~~Have a look at the following [video](http://www.youtube.com/watch?v=xUggUXQArUM) to get any idea of how to use TiShadow and what it can do.~~ (A little outdated.)

Have a look at this [presentation](http://www.slideshare.net/londontitanium/titanium-london-tishadow-july-2012) (July 2012) recently given at the TiLondon meetup for a look at most of what you can do with TiShadow.


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

**NEW**

TiShadow App now requires the following:

 * Some native zip modules what are included in the app/modules
   directory. Install these as you would any native module. Please see
    the README file there. 
 * A custom build of the Titanium SDK is needed. OSX builds can be download from the
   "Downloads" section and are in line with the Titanium SDK Releases 2.0.2
   and newer. The source can be found in the my titanium_mobile fork with each release
   tagged, e.g., tishadow_2_X_X. The following [commit](https://github.com/dbankier/titanium_mobile/commit/d332a846701df512003fdcb1fe791a6497348515) contains all the changes.

~~Since the TiShadow app is not _yet_ in the App Store or Google Play~~, clone the 
code and run/install as you would any Titanium project.


How To
======

Common Tasks
------------

Fire up the server and launch the app.
From the app just enter the ip address of the computer running the node
server and hit connect.


Code Snippets Via Webpage
-------------------------
Enter the following address in a browser window:

```
    http://localhost:3000/
```

In the editor you can enter code and press Command+s to deploy the code
snippet to all connected devices.

Have a look at the demo [video](http://www.youtube.com/watch?v=xUggUXQArUM).

If you want to include setup and clean up code, make sure you wrap your
code in an anonymous function that returns `open` and `close`
functions.

For example, a window could be one such object:

```javascript
    (function() {
      var win = Ti.UI.createWindow();

      return win;
    }());
```

Full Application Deployment
---------------------------

Recently added to TiShadow is the ability to deploy full application. It
is still in beta, but can be used for simple applications.

If you installed TiShadow using npm, go to the root folder of your
project and enter the following command to deploy an app:

```bash
  tishadow
```

(For manual installs, the `tishadow` script is included in the build folder. You may want to include the script in your
environment path.)

If the app has been deployed and you want to push minor updates, use the following command:

```bash
  tishadow update
```

The app is then cached on the device. If need to clear the cache, use
the following command:

```bash
  tishadow clear
```

__Some notes and limitations__

 * Only works with applications that use the CommonJS structure. The use
   of `Ti.include` will not work.
 * CommonJS modules should be required with their full path, ie /
   leading. (This is a better practice anyway given the difference
   between iOS and Android.)
 * Only files in the Resources directory will will be sent to the device
   using TiShadow. That said, localisation files **are** supported. 
 * Native modules _can_ be supported if built into the TiShadow app
   first. (I.e., add them to the tiapp.xml of the TiShadow app.)
 * If there any errors about a Titanium SDK command not being found, add
   them to the Includes.js files and clean and build the TiShadow app. I
   will gradually be adding commands.)
 * Any Ti.API logs will be redirected to the tishadow webpage.

If you want to make sure the previous app deployed is closed prior to
launching the new one, include the following code snippet in your
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

**RECENTLY ADDED**

TiShadow now support [Jasmine](http://pivotal.github.com/jasmine/) BDD tests. 
Insipration taken from these two projects: [titanium-jasmine](https://github.com/guilhermechapiewski/titanium-jasmine/) and [jasmine-titanium](https://github.com/akahigeg/jasmine-titanium)

Include your specs in the `Resources/spec` path of your project. Ensure
the files are ending in `_spec.js`. (Note: simply write the spec without any including/requiring the jasmine library.)

To execute the tests enter the following command:

```bash
  tishadow spec
```

Alternatively the following command is also supported if there are only
minor changes: 

```bash
  tishadow spec update
```

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
TiShadow now supports localisation. You can also chose the locale locale
you wish to execute when launch your app/tests. Simply add the
two-letter language code to your command. For example:

```bash
  tishadow en
  tishadow update es
  tishadow spec nl
  tishadow spec update es
```


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
    :map <F6> <Esc>:w<CR>:!tishadow update<CR>a
    :imap <F6> <Esc>:w<CR>:!tishadow update<CR>a
    :map <S-F6> <Esc>:w<CR>:!tishadow<CR>a
    :imap <S-F6> <Esc>:w<CR>:!tishadow<CR>a 
```


Feedback appreciated.

@davidbankier



