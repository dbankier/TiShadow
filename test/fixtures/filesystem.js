/*
 * Copyright (c) 2011-2014 YY Digital Pty Ltd. All Rights Reserved.
 * Please see the LICENSE file included with this distribution for details.
 */

Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory + "sounds/my.wav");
Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, "sounds/my.wav");
Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, "sounds", "my.wav");
Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, "sounds", "music", "my.wav");
Ti.Filesystem.getResourcesDirectory();
Ti.Filesystem.resourcesDirectory + "sounds/my.wav";
