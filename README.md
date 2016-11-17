TiShadow
========

TiShadow provides Titanium developers the ability to deploy apps, run tests or execute code snippets live across all running iOS and Android devices.

There are three parts to TiShadow: the TiShadow server, TiShadow app and TiShadow CLI
which are all need.

~~Have a look at this [presentation](http://www.slideshare.net/londontitanium/titanium-london-tishadow-july-2012) (July 2012) given at the TiLondon meetup for a look at most of what you can do with TiShadow.~~ (Outdated)

Go to the new [project website](http://tishadow.yydigital.com)

Join the discussion on the [Google Group](https://groups.google.com/forum/?fromgroups=#!forum/tishadow).
You can also find some TiShadow related blog posts
[here](http://www.yydigital.com/blog)


Getting Started
===============

TiShadow Install
----------------

### TiShadow NPM Package

TiShadow is built on [node.js](http://nodejs.org/) and is required.

TiShadow can be installed via npm using the following command:

```
$  npm install -g tishadow
```

**PLEASE NOTE:** The package installs titanium hooks in the post install. 
If you install with `sudo` and get the error `Unable to write config file...` use the following command:

```
$ sudo npm install -g tishadow --unsafe-perm
```

Or if you want to use the master version directly from GitHub:

```
  npm install -g dbankier/TiShadow
```

### Using the Appcelerator CLI

By default TiShadow uses the (free) `titanium` and `alloy` cli's under the hood. If you are using the (paid) `appc` cli then 
use the following command after installation:

```
$ ts config --use-appc-CLI
```

### _NEW_ DUMMY'S PATH: TiShadow Express

You can do _a lot_ with TiShadow. Keep reading this README to find out more.
But if it is all too much at the moment and you just want to use it for
live reload you can do the following.

During install a titanium cli plugin/hook was installed for you. From your project you can just use the following command:

```
  titanium build -p android -T device --shadow 
```

This will launch your app in the simulator and reload with any code/style/localisation changes.

Under the hood it:
 1. starts the tishadow server - `tishadow server`
 2. creates and launches an appified version of your app - `tishadow appify` (with extra flags)
 3. watches your code and push on any changes - `tishadow @ run --update`

**MAC**: If you get the error `EMFILE: Too many opened files.`, this is because of your system's max opened file limit. For OSX the default is very low (256). Increase your limit temporarily with `ulimit -n 8192`, the number being the new max limit.

### TiShadow App

To create a new titanium project use the following command:

```
  tishadow app -d [destination folder]
```

e.g.

```
  mkdir ~/tishadowapp
  tishadow app -d ~/tishadowapp
```

**NOTE**: In general upgrade the server side and app at
the same time (using the `tishadow app` command).

You can upgrade an existing tishadow app using the `--upgrade` flag.

Start the TiShadow Server
---------------------

The server can be started by typing the following command:

```
  tishadow server
```

The following options are available:

```
    -h, --help             output usage information
    -p, --port <port>      server port
    -l, --long-polling     force long polling
    -i, --internal-ip <internal-ip>  internal ip to bind to
    -s, --screenshot-path <screenshot-path>  path to save screenshot (defaults to /tmp)
    -z, --manage-versions  manage and automatically update bundles
```

If `--manage-versions` is enabled, then bundle versions are tracked and
devices that connect with an older version will automatically be
updated. When using this mode, you can use the `tishadow deploy` command
to send a new bundle to the server without pushing it to connected
devices.

### Remote Server Mode and Private Rooms

The TiShadow Server supports remote hosting with configurable http
ports. It also allow for private "rooms" (much like chat rooms) so that
the TiShadow server can be shared. 

The `tishadow log` command is
available to tail remote server logs (in the default or selected room).

The `tishadow config` command is available to set the default host, port
and room for all the relevant command below.


Start the TiShadow App
----------------------

Once the server is running launch the app. For example, to launch the
app in the iPhone simulator using the Titanium CLI:

```
  cd ~/tishadowapp
  titanium build -p iphone
```

From the app just enter the ip address or hostname of the computer running the
server and hit connect. (There are also more advanced connection settings
that can be used for remote server connections.)


What you can do with TiShadow
=============================

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
    -h, --help                           output usage information
    -u, --update                         only send recently changed files
    -a, --patch                          patch updated files without causing app restart
    -i, --inspector                      enable automatic inspection and spies
    -l, --locale <locale>                set the locale in in the TiShadow app
    -j, --jshint                         analyse code with JSHint
    -t, --tail-logs                      tail server logs on deploy
    -o, --host <host>                    server host name / ip address
    -p, --port <port>                    server port
    -r, --room <room>                    server room
    -s, --skip-alloy-compile             skip automatic alloy compilation
    -f, --alloy-compile-file <filename>  compile only one alloy file
    -P, --platform <platform>            target platform
    -D, --include-dot-files              includes dot files in the bundle (defaults to false)
    -T, --target <app_name>              target TiShadow app (defaults to name on tiapp.xml or moduleid on manifest)
    -c, --ticommonjs                     support for applications using the ti-commonjs library
```

The app is then cached on the device. If you need to clear the cache, use
the following command:

```
  tishadow clear
```

__Some notes and limitations__

 * Only files in the Resources directory will be sent to the device
   using TiShadow. That said, localisation files **are** supported. (see
   options above). 
 * Native modules _can_ be supported if built into the TiShadow app
   first. (I.e., add them to the tiapp.xml of the TiShadow app.)
 * Custom fonts will be loaded if placed in the `Resources/fonts`
   directory for iOS only.
 * If there any errors about a Titanium SDK command not being found, add
   them to the Includes.js files and clean and build the TiShadow app. (I
   will gradually be adding commands.)
 * Any Ti.API logs will be redirected to the server logs and webpage.


Testing / Assertions
--------------------

TiShadow supports [Jasmine](http://pivotal.github.com/jasmine/) BDD tests. 
(Insipration taken from these two projects: [titanium-jasmine](https://github.com/guilhermechapiewski/titanium-jasmine/) and [jasmine-titanium](https://github.com/akahigeg/jasmine-titanium))

Include your specs in the `spec` path of your project. Ensure
the files are ending in `_spec.js`. (Note: simply write the spec without any including/requiring the jasmine library.)

To execute the tests enter the following command:

```bash
  tishadow spec
```

Here are a full list of options:

```
    -h, --help                           output usage information
    -u, --update                         only send recently changed files
    -l, --locale <locale>                set the locale in in the TiShadow app
    -o, --host <host>                    server host name / ip address
    -p, --port <port>                    server port
    -r, --room <room>                    server room
    -t, --type <type>                    testing library
    -j, --jshint                         analyse code with JSHint
    -x, --junit-xml                      output report as JUnit XML
    -P, --platform <platform>            target platform
    -s, --skip-alloy-compile             skip automatic alloy compilation
    -f, --alloy-compile-file <filename>  compile only one alloy file
    -D, --include-dot-files              includes dot files in the bundle (defaults to false)
    -T, --target <app_name>              target TiShadow app (defaults to name on tiapp.xml or moduleid on manifest)
    -C, --clear-spec-files               clears only the spec files from the cache
    -c, --coverage <report_types>        runs code coverage, for available report_types see https://github.com/gotwarlost/istanbul#the-report-command```
```

**NEW**: You can now select the testing library to use `jasmine`, `mocha-should` or `mocha-chai`. 
The default library is `jasmine` to change that use, e.g. `tishadow config -t mocha-should`.

**NEW**: test coverage reports using instanbul is also available using the `--coverage <report_types>` flag.

The test results will be returned to the server/cli output:
![Spec Output](http://github.com/dbankier/TiShadow/raw/master/example/spec.png)

See the included example project or this [blog post](http://www.yydigital.com/blog/2013/2/14/Testing_Alloy_With_Jasmine_And_TiShadow).


_Alternatively (yet not preferred/depcrecated)_

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

TiShadow REPL
-------------

The TiShadow REPL is available and evaluates commands in a
persistent sand-boxed context. 

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

`require()`, `Ti.include()` and assets are relative the running app
inside the TiShadow app.

**note**: you can now also pipe to the tishadow repl using the `--pipe` flag. have a look 
at this [screencast](http://www.youtube.com/watch?v=f9ZLAtzJdGY)

###Spies

You can add **spies** on objects so that you can modify them from
the repl at run time. In your code add the following command:
`addSpy(name, object)`. This can be included as a comment, eg:
`//addSpy("mywindow",win)` which will be uncommented when pushed.
To get the object, simply use, e.g. `getSpy("mywindow")` from the repl.

If you want to use the web-browser based inspector and/or automatic spy insertion,
then use the `--inspector` flag with `run` or `config`. 

Screenshots
-----------

You can capture screenshots of all connected devices using the following command: 

```
  $ tishadow screenshot
```

The screenshots will be saved in `png` format in the `/tmp` directory or the path
configured using the `--screenshot-path` flag when starting the server.

###Screencast mode

Instead of saving the screenshots you can stream them to the browser. Use the following command:

```
  $ tishadow screenshot --screencast 1000 --scale 0.1
```

In the above example a screenshot is sent every 1000ms and scales the images to 10% of their height/width.
Go to: `http://localhost:3000/screencast` to view the screencast.


Code Snippets Via Webpage
-------------------------
 
Enter the following address in a browser window:

```
    http://localhost:3000/
```

In the editor you can enter code and press Command+s to deploy the code
snippet to all connected devices. Have a look at the demo [video](http://www.youtube.com/watch?v=xUggUXQArUM).

Coding from the webpage works much like the REPL and variables
are stored in a sand-boxed context. See the next section.


TiShadow Appify
---------------

The `tishadow appify` command can be used to create a
stand-alone app that is integrated with TiShadow. It automatically
launches the contained tishadow bundle and connects to a pre-configured
server. The allows connecting to the deployed app via the repl and/or
push upgrades.

```
  Usage: appify [options]

  Options:

    -h, --help                output usage information
    -d, --destination <path>  target path for generated project
    -o, --host <host>         set server host name / ip address
    -p, --port <port>         set server port
    -r, --room <room>         set server room
```

See the following [blog post](http://www.yydigital.com/blog/2013/2/19/TiShadow_Appify).

**NEW**: if you want to quickly create and launch/deploy and appified app you can use
the tishadow titanium hook. For example

~~~
$ ti build -p ios -F ipad -T device --appify
~~~

TiShadow CLI defaults
---------------------

You can use the `tishadow config` command to set some tishadow cli defaults.

The following are some of the options you can set:

~~~
    -h, --help                           output usage information
    -o, --host <host>                    set default server host name / ip address
    -p, --port <port>                    set default server port
    -r, --room <room>                    set default server room
    -i, --inspector                      enable automatic inspection and spies
    -b, --boost                          use super fast selective alloy compilation
    -t, --type <type>                    default testing library
    -w, --watch-delay <millis>           time to wait before responding to for changes (default: 0)
    -i, --watch-interval <millis>        time to wait between checking files for changes (default: 100)
    -x, --watch-exclude <glob>           files to exclude from watch
    -n, --network-interface <interface>  set default network interface (used in express mode)
~~~


Launch From Web
---------------

_Currently only working on iOS_

You can also use TiShadow to bundle an app and launch it from a web
page. Use the command `tishadow bundle` to bundle the app for a
TiShadow distribution. Then include a link to the bundle in your webpage
using the following format, e.g. : `tishadow://mydomain.com/bundle.zip`.
Tapping on the link from your browser should launch the app in TiShadow.


VIM Shortcuts
-------------
Those using vim/gvim/mvim for development might want to add these
shortcuts (or similar) to the .vimrc/.gvimrc files. It add the shortcuts, F6
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
####iPhone/Android

Now using ti.compression:
[titanium_modules](https://github.com/appcelerator/titanium_modules)

Contributors
------------

```
 project  : TiShadow
 repo age : 4 years, 8 months
 active   : 376 days
 commits  : 873
 files    : 240
 authors  : 
   643	David Bankier           73.7%
    72	Fokke Zandbergen        8.2%
    42	dbankier                4.8%
    28	Jong Eun Lee            3.2%
    12	Guillermo Zunino        1.4%
     8	Javen Wang              0.9%
     8	InGrowth                0.9%
     7	Ismael Viamontes Marrero 0.8%
     4	Denny Biasiolli         0.5%
     3	Joshua Ogle             0.3%
     3	Eric Boehs              0.3%
     3	m1ga                    0.3%
     3	Michael                 0.3%
     2	Jordan                  0.2%
     2	kopiro                  0.2%
     2	noughts                 0.2%
     2	Matt Apperson           0.2%
     2	Chris Barber            0.2%
     2	Flavio De Stefano       0.2%
     1	clairecoloma            0.1%
     1	danghy                  0.1%
     1	falkolab                0.1%
     1	Carlos Henrique Zinato  0.1%
     1	jsjant                  0.1%
     1	katangagonzalez         0.1%
     1	iskugor                 0.1%
     1	Clément Blanco         0.1%
     1	Dan Kronholm, Bitfabrikken 0.1%
     1	Donggu Lee              0.1%
     1	Erlan                   0.1%
     1	Gilberto Avalos         0.1%
     1	Hazem Khaled            0.1%
     1	Hugh Cannon             0.1%
     1	Hy Dang                 0.1%
     1	Ivan Skugor             0.1%
     1	Jeff Bonnes             0.1%
     1	Jongeun Lee             0.1%
     1	Lee, Jong Eun           0.1%
     1	Lee, JongEun            0.1%
     1	Luis Cruz               0.1%
     1	Pedro Palmero           0.1%
     1	Terry Morgan            0.1%
     1	Timan Rebel             0.1%
     1	astronaughts            0.1%
```

Feedback appreciated.

@davidbankier




