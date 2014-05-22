Ti.Filesystem.getFile(__p.file(Ti.Filesystem.applicationDataDirectory + require("/api/TiShadow").currentApp + "/" + "sounds/my.wav"));

Ti.Filesystem.getFile(__p.file(__p.endsWithPathSeparator(Ti.Filesystem.applicationDataDirectory + require("/api/TiShadow").currentApp + "/") + "sounds/my.wav"));

Ti.Filesystem.getFile(__p.file(__p.endsWithPathSeparator(Ti.Filesystem.applicationDataDirectory + require("/api/TiShadow").currentApp + "/") + (__p.endsWithPathSeparator("sounds") + "my.wav")));

Ti.Filesystem.getFile(__p.file(__p.endsWithPathSeparator(Ti.Filesystem.applicationDataDirectory + require("/api/TiShadow").currentApp + "/") + (__p.endsWithPathSeparator("sounds") + (__p.endsWithPathSeparator("music") + "my.wav"))));

Ti.Filesystem.getFile(__p.file(__p.endsWithPathSeparator(variableDirectoryName) + (__p.endsWithPathSeparator("sounds") + "my.wav")));

Ti.Filesystem.getFile(__p.file(__p.endsWithPathSeparator(variableDirectoryName) + (__p.endsWithPathSeparator(soundsDirectoryName) + "my.wav")));

Ti.Filesystem.getApplicationDataDirectory() + require("/api/TiShadow").currentApp + "/";

Ti.Filesystem.applicationDataDirectory + require("/api/TiShadow").currentApp + "/" + "sounds/my.wav";