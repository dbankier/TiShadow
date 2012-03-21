TiShadow
========

TiShadow provides Titanium developers the ability to write code snippets in a browser
and render the code across all iOS and Android devices. **NEW** TiShadow now
also allows the deployment of apps to devices. There are three
parts to TiShadow, the TiShadow server, TiShadow app and build scripts
for deploying full applications.

Have look at the following [video](http://www.youtube.com/watch?v=xUggUXQArUM) to get any idea of how to use TiShadow and what it can do.


TiShadow Server
---------------
The server side uses the following and are required:

 * [node.js](http://nodejs.org/)
 * [express] (http://expressjs.com/)
 * [socket.io] (http://socket.io)

The server code also uses the following and are included:

 * [Twitter Bootstrap](http://twitter.github.com/bootstrap/)
 * [Ace](https://github.com/ajaxorg/ace)

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
 * A custom build of the Titanium SDK. These can be retrieved from the
   `tishadow` branch of my fork of the titanium mobile sdk.

Clone the code and run/install as you would any Titanium project.


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
is still in beta, but can be used for simple application.

Simply go the project root of your folder and run the `tishadow` script
included in the build folder. You may want to include the script in your
environment path.

Some notes:

 * Only works with applications that use the CommonJS structure. The use
   of `Ti.include` will not work.
 * Only files in the Resources directory will will be sent to the device
   using TiShadow. Therefore native modules, localisation
   and custom changes to the Android Manifest are not supported.

If you want to make sure the previous app deployed is closed prior to
launching the new one, include the following code snippet in your
`app.js` file:

```javascript
    if (exports) {
      exports.close = function() {
        // Your code to close, e.g, main_window.close();
      };
    }
```


Feedback appreciated.



