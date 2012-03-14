TiShadow
========

TiShadow provides Titanium developers the ability to write code snippets in a browser
and render the code across all iOS and Android devices. There are two
parts to TiShadow, the TiShadow server and TiShadow app.

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

Clone the code and run/install as you would any Titanium project.


To Do
-----
 * A better README file.
 * Take this from deploying code snippets to full apps.


